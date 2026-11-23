

const { prisma } = require("../config/db");
const AppError = require("../utils/AppError");

exports.askCourseTutor = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { question, source_names } = req.body;

    // Validate question
    if (typeof question !== "string" || !question.trim()) {
      return next(
        new AppError("Please provide a valid question", 400, "VALIDATION_ERROR")
      );
    }

    // Validate optional source_names
    if (
      source_names !== undefined &&
      source_names !== null &&
      (!Array.isArray(source_names) ||
        !source_names.every((name) => typeof name === "string"))
    ) {
      return next(
        new AppError("source_names must be an array of strings", 400, "VALIDATION_ERROR")
      );
    }

    // Verify student enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return next(
        new AppError(
          "You must be enrolled in this course to use its AI Tutor",
          403,
          "ENROLLMENT_REQUIRED"
        )
      );
    }

    // FastAPI base URL
    const AI_API_URL = (
      process.env.AI_API_URL || "http://localhost:8000"
    ).replace(/\/+$/, "");

    let aiResponse;

    try {
      aiResponse = await fetch(
        `${AI_API_URL}/api/courses/${encodeURIComponent(courseId)}/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.trim(),
            source_names: source_names ?? null,
          }),
          signal: AbortSignal.timeout(60000),
        }
      );
    } catch (error) {
      if (error.name === "TimeoutError") {
        return next(
          new AppError("AI Tutor request timed out", 504, "AI_TUTOR_TIMEOUT")
        );
      }

      return next(
        new AppError("AI Tutor service is unavailable", 503, "AI_SERVICE_UNAVAILABLE")
      );
    }

    const responseText = await aiResponse.text();

    let aiData;

    try {
      aiData = JSON.parse(responseText);
    } catch {
      return next(
        new AppError("Invalid response received from AI service", 502, "AI_INVALID_RESPONSE")
      );
    }

    if (!aiResponse.ok) {
      const statusCode =
        aiResponse.status >= 500 ? 502 : aiResponse.status;

      return next(
        new AppError(
          aiData.detail || "AI Tutor could not process your question",
          statusCode,
          "AI_TUTOR_ERROR"
        )
      );
    }

    return res.status(200).json({
      success: true,
      data: aiData,
=======
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

