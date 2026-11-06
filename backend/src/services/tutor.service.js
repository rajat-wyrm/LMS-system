const AppError = require('../utils/AppError');

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
 * Creates or retrieves an existing chat session for the specified notebook.
 * Endpoint: POST /api/notebooks/{notebookId}/chats
 * @param {string} notebookId
 * @param {string} title
 * @returns {Promise<object>} Chat object from FastAPI
 */
const getOrCreateChat = async (notebookId, title = 'Tutor Session') => {
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
 * 2. Gets or creates a chat session via FastAPI.
 * 3. Forwards the question to the chat session.
 * 4. Returns formatted response with answer, sources, courseId, notebookId, and chatId.
 *
 * @param {object} params
 * @param {string} params.courseId
 * @param {string} params.question
 * @param {string} [params.userId]
 * @returns {Promise<object>} Formatted response
 */
const askTutor = async ({ courseId, question, userId }) => {
  const notebookId = resolveNotebookId(courseId);

  // 1. Initialize or retrieve chat session
  const chat = await getOrCreateChat(notebookId, 'Tutor Session');
  if (!chat || !chat.id) {
    throw new AppError('Invalid chat session returned by AI service', 502, 'DOWNSTREAM_ERROR');
  }

  // 2. Post question to the chat
  const result = await postQuestionToChat(chat.id, question);

  return {
    answer: result.answer || '',
    sources: Array.isArray(result.sources) ? result.sources : [],
    courseId,
    notebookId,
    chatId: chat.id,
  };
};

module.exports = {
  resolveNotebookId,
  askTutor,
  getOrCreateChat,
  postQuestionToChat,
  getAiServiceBaseUrl,
  getTutorTimeoutMs,
};
