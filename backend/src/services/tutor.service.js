const crypto = require('crypto');
const AppError = require('../utils/AppError');

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Returns the base URL for the FastAPI AI microservice.
 * Configurable via AI_SERVICE_URL environment variable.
 */
const getAiServiceBaseUrl = () => {
  return (process.env.AI_SERVICE_URL || 'http://localhost:8000/api').replace(/\/+$/, '');
};

/**
 * Returns the request timeout in milliseconds for AI Tutor requests.
 * Configurable via TUTOR_TIMEOUT_MS environment variable.
 */
const getTutorTimeoutMs = () => {
  return parseInt(process.env.TUTOR_TIMEOUT_MS, 10) || 15000;
};

/**
 * Resolves the deterministic notebook ID for a given course ID.
 * Adheres to verified convention: nb_course_${courseId}
 * @param {string} courseId
 * @returns {string} notebookId
 */
const resolveNotebookId = (courseId) => {
  if (!courseId || typeof courseId !== 'string') {
    throw new AppError('Valid courseId is required', 400, 'VALIDATION_ERROR');
  }
  return `nb_course_${courseId.trim()}`;
};

/**
 * Parses and strictly validates a user-owned chat session title.
 * Expected format: Tutor_<userId>_<sessionUuid>
 * @param {string} title
 * @returns {{ titleUserId: string, sessionUuid: string } | null}
 */
const parseUserChatTitle = (title) => {
  if (typeof title !== 'string' || !title.startsWith('Tutor_')) {
    return null;
  }
  const rest = title.slice(6); // remove "Tutor_"
  const lastUnderscoreIndex = rest.lastIndexOf('_');
  if (lastUnderscoreIndex === -1) {
    return null;
  }
  const titleUserId = rest.slice(0, lastUnderscoreIndex);
  const sessionUuid = rest.slice(lastUnderscoreIndex + 1);

  if (!titleUserId || !UUID_REGEX.test(sessionUuid)) {
    return null;
  }

  return { titleUserId, sessionUuid };
};

/**
 * Executes a fetch request with timeout enforcement and mapped errors.
 * @param {string} url
 * @param {object} options
 * @param {number} timeoutMs
 * @returns {Promise<Response>}
 */
const fetchWithTimeout = async (url, options = {}, timeoutMs = getTutorTimeoutMs()) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      throw new AppError('AI Tutor service request timed out', 504, 'GATEWAY_TIMEOUT');
    }
    if (
      err.code === 'ECONNREFUSED' ||
      err.cause?.code === 'ECONNREFUSED' ||
      err.code === 'ENOTFOUND' ||
      err.message?.includes('fetch failed')
    ) {
      throw new AppError('AI Tutor service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Creates or retrieves a chat session for the specified notebook.
 * Endpoint: POST /api/notebooks/{notebookId}/chats
 * @param {string} notebookId
 * @param {string} title
 * @returns {Promise<object>} Chat object from FastAPI
 */
const getOrCreateChat = async (notebookId, title) => {
  const baseUrl = getAiServiceBaseUrl();
  const url = `${baseUrl}/notebooks/${encodeURIComponent(notebookId)}/chats`;

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (response.status === 404) {
    throw new AppError(
      `Course notebook not found for ID: ${notebookId}`,
      404,
      'RESOURCE_NOT_FOUND'
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new AppError(
      `Failed to initialize chat session with AI service: ${response.status} ${errorText}`.trim(),
      response.status >= 500 ? 502 : response.status,
      'DOWNSTREAM_ERROR'
    );
  }

  return response.json();
};

/**
 * Retrieves all chat sessions for a given notebook.
 * Endpoint: GET /api/notebooks/{notebookId}/chats
 * @param {string} notebookId
 * @returns {Promise<Array>} List of chat objects
 */
const getNotebookChats = async (notebookId) => {
  const baseUrl = getAiServiceBaseUrl();
  const url = `${baseUrl}/notebooks/${encodeURIComponent(notebookId)}/chats`;

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 404) {
    throw new AppError(
      `Course notebook not found for ID: ${notebookId}`,
      404,
      'RESOURCE_NOT_FOUND'
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new AppError(
      `Failed to retrieve chats from AI service: ${response.status} ${errorText}`.trim(),
      response.status >= 500 ? 502 : response.status,
      'DOWNSTREAM_ERROR'
    );
  }

  return response.json();
};

/**
 * Forwards a question to the FastAPI chat ask endpoint.
 * Endpoint: POST /api/chats/{chatId}/ask
 * @param {string} chatId
 * @param {string} question
 * @returns {Promise<object>} { answer: string, sources: Array }
 */
const postQuestionToChat = async (chatId, question) => {
  const baseUrl = getAiServiceBaseUrl();
  const url = `${baseUrl}/chats/${encodeURIComponent(chatId)}/ask`;

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (response.status === 404) {
    throw new AppError(
      `Chat session not found: ${chatId}`,
      404,
      'RESOURCE_NOT_FOUND'
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new AppError(
      `Failed to get answer from AI service: ${response.status} ${errorText}`.trim(),
      response.status >= 500 ? 502 : response.status,
      'DOWNSTREAM_ERROR'
    );
  }

  return response.json();
};

/**
 * Main service workflow for the AI Tutor gateway:
 * 1. Resolves notebook ID deterministically from course ID.
 * 2. If chatId is provided:
 *    - Validates chat exists in the target course notebook.
 *    - Validates chat title matches expected user-owned format and belongs to user.
 *    - Uses that chatId.
 * 3. If chatId is absent:
 *    - Generates user-isolated session title: Tutor_${userId}_${crypto.randomUUID()}
 *    - Creates chat session via FastAPI.
 * 4. Forwards question to the chat session.
 * 5. Returns formatted response with answer, sources, courseId, notebookId, and chatId.
 *
 * @param {object} params
 * @param {string} params.courseId
 * @param {string} params.question
 * @param {string} [params.chatId]
 * @param {string} params.userId
 * @returns {Promise<object>} Formatted response
 */
const askTutor = async ({ courseId, question, chatId, userId }) => {
  if (!userId || typeof userId !== 'string') {
    throw new AppError('User authentication required', 401, 'AUTHENTICATION_ERROR');
  }

  const notebookId = resolveNotebookId(courseId);
  let targetChatId = chatId;

  if (targetChatId) {
    // 1. Follow-up turn: Validate existing chat in requested course notebook
    const chats = await getNotebookChats(notebookId);
    if (!Array.isArray(chats)) {
      throw new AppError('Invalid chat list returned by AI service', 502, 'DOWNSTREAM_ERROR');
    }

    const matchedChat = chats.find((c) => c && c.id === targetChatId);
    if (!matchedChat) {
      throw new AppError(
        `Chat session not found in course notebook: ${targetChatId}`,
        404,
        'RESOURCE_NOT_FOUND'
      );
    }

    // 2. Validate ownership & title structure (strictly parsed, no loose startsWith)
    const parsed = parseUserChatTitle(matchedChat.title);
    if (!parsed || parsed.titleUserId !== userId) {
      throw new AppError('Access denied to this chat session', 403, 'FORBIDDEN');
    }
  } else {
    // 3. First turn: Create new isolated conversation session
    const sessionUuid = crypto.randomUUID();
    const title = `Tutor_${userId}_${sessionUuid}`;
    const chat = await getOrCreateChat(notebookId, title);

    if (!chat || !chat.id) {
      throw new AppError('Invalid chat session returned by AI service', 502, 'DOWNSTREAM_ERROR');
    }
    targetChatId = chat.id;
  }

  // 4. Forward question to the chat session
  const result = await postQuestionToChat(targetChatId, question);

  return {
    answer: result.answer || '',
    sources: Array.isArray(result.sources) ? result.sources : [],
    courseId,
    notebookId,
    chatId: targetChatId,
  };
};

module.exports = {
  resolveNotebookId,
  parseUserChatTitle,
  askTutor,
  getOrCreateChat,
  getNotebookChats,
  postQuestionToChat,
  getAiServiceBaseUrl,
  getTutorTimeoutMs,
};
