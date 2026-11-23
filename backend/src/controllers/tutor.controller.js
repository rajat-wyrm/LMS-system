const tutorService = require('../services/tutor.service');

/**
 * @desc    Ask a question to the AI Tutor for a specific course
 * @route   POST /api/v1/tutor/ask
 * @access  Private (Authenticated users only)
 */
const askQuestion = async (req, res, next) => {
  try {
    const { courseId, question, chatId } = req.body;
    const userId = req.user ? req.user.id : null;

    const result = await tutorService.askTutor({
      courseId,
      question,
      chatId,
      userId,
    });

    return res.status(200).json({
      success: true,
      data: {
        answer: result.answer,
        sources: result.sources,
        courseId: result.courseId,
        notebookId: result.notebookId,
        chatId: result.chatId,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  askQuestion,
};
