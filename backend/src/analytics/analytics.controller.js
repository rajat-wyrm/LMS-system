const analyticsService = require('./analytics.service');
const csvExporter = require('../utils/csvExporter');
const { sendSuccessResponse } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

// ID Validation regex: only alphanumeric characters, hyphens, and underscores
const ID_VALIDATION_REGEX = /^[a-zA-Z0-9-_]+$/;

// Allowed report types for export
const ALLOWED_REPORTS = ['dashboard', 'course', 'user', 'enrollment', 'progress'];

/**
 * Controller handler to fetch dashboard summary analytics
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const data = await analyticsService.getDashboardSummary();
    return sendSuccessResponse(res, 200, 'Dashboard analytics fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller handler to fetch course analytics
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getCourseAnalytics = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Validate empty/missing courseId
    if (!courseId || courseId.trim() === '') {
      throw new AppError('Course ID is required and cannot be empty', 400, 'VALIDATION_ERROR');
    }

    // Validate ID format
    if (!ID_VALIDATION_REGEX.test(courseId)) {
      throw new AppError('Invalid course ID', 400, 'VALIDATION_ERROR');
    }

    const data = await analyticsService.getCourseAnalytics(courseId);

    // Validate missing resource
    if (!data) {
      throw new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
    }

    return sendSuccessResponse(res, 200, 'Course analytics fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller handler to fetch user analytics
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getUserAnalytics = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate empty/missing userId
    if (!userId || userId.trim() === '') {
      throw new AppError('User ID is required and cannot be empty', 400, 'VALIDATION_ERROR');
    }

    // Validate ID format
    if (!ID_VALIDATION_REGEX.test(userId)) {
      throw new AppError('Invalid user ID', 400, 'VALIDATION_ERROR');
    }

    const data = await analyticsService.getUserAnalytics(userId);

    // Validate missing resource
    if (!data) {
      throw new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
    }

    return sendSuccessResponse(res, 200, 'User analytics fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller handler to export CSV reports
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const exportReport = async (req, res, next) => {
  try {
    const { type } = req.query;

    // Validate missing or empty type query param
    if (!type || type.trim() === '') {
      throw new AppError(
        'Report type is required. Allowed values are: dashboard, course, user, enrollment, progress',
        400,
        'VALIDATION_ERROR'
      );
    }

    // Validate report type format and allowed options
    const normalizedType = type.toLowerCase().trim();
    if (!ALLOWED_REPORTS.includes(normalizedType)) {
      throw new AppError(
        `Invalid report type '${type}'. Allowed values are: dashboard, course, user, enrollment, progress`,
        400,
        'VALIDATION_ERROR'
      );
    }

    let csvContent = '';
    // Fetch and process report data based on requested type
    switch (normalizedType) {
      case 'dashboard': {
        const dashboardData = await analyticsService.getDashboardSummary();
        csvContent = csvExporter.generateDashboardReport(dashboardData);
        break;
      }
      case 'course': {
        const coursesData = await analyticsService.getAllCoursesReportData();
        csvContent = csvExporter.generateCourseReport(coursesData);
        break;
      }
      case 'user': {
        const usersData = await analyticsService.getAllUsersReportData();
        csvContent = csvExporter.generateUserReport(usersData);
        break;
      }
      case 'enrollment': {
        const enrollmentsData = await analyticsService.getAllEnrollmentsReportData();
        csvContent = csvExporter.generateEnrollmentReport(enrollmentsData);
        break;
      }
      case 'progress': {
        const progressData = await analyticsService.getAllProgressReportData();
        csvContent = csvExporter.generateProgressReport(progressData);
        break;
      }
    }

    // Configure response headers for secure, downloadable CSV file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${normalizedType}_report.csv`);
    res.setHeader('Cache-Control', 'no-store');

    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getCourseAnalytics,
  getUserAnalytics,
  exportReport
};
