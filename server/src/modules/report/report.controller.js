import * as reportService from './report.service.js';
import { sendSuccess, sendPaginated } from '../../shared/utils/response.js';
import { getPagination, buildPaginationMeta } from '../../shared/utils/pagination.js';

export async function generateReport(req, res, next) {
  try {
    const report = await reportService.generateReport(req.body.reportType, req.body.month, req.user.id);
    sendSuccess(res, 'Report generated', report, 201);
  } catch (err) {
    next(err);
  }
}

export async function getReports(req, res, next) {
  try {
    const query = req.validatedQuery || req.query;
    const { page, limit, offset } = getPagination(query);
    const { reportType, reportMonth } = query;
    const { reports, total } = await reportService.getReports({ limit, offset, reportType, reportMonth });
    sendPaginated(res, 'Reports fetched', reports, buildPaginationMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
}

export async function getReportById(req, res, next) {
  try {
    const report = await reportService.getReportById(req.params.id);
    sendSuccess(res, 'Report fetched', report);
  } catch (err) {
    next(err);
  }
}

export async function getOverallSummary(req, res, next) {
  try {
    const { month } = req.validatedQuery || req.query;
    const data = await reportService.getOverallSummary(month);
    sendSuccess(res, 'Overall summary fetched', data);
  } catch (err) {
    next(err);
  }
}

export async function getEmployeeWiseSummary(req, res, next) {
  try {
    const { month } = req.validatedQuery || req.query;
    const data = await reportService.getEmployeeWiseSummary(month);
    sendSuccess(res, 'Employee-wise summary fetched', data);
  } catch (err) {
    next(err);
  }
}

export async function getDepartmentWiseSummary(req, res, next) {
  try {
    const { month } = req.validatedQuery || req.query;
    const data = await reportService.getDepartmentWiseSummary(month);
    sendSuccess(res, 'Department-wise summary fetched', data);
  } catch (err) {
    next(err);
  }
}

export async function getLeaveTypeWiseSummary(req, res, next) {
  try {
    const { month } = req.validatedQuery || req.query;
    const data = await reportService.getLeaveTypeWiseSummary(month);
    sendSuccess(res, 'Leave-type-wise summary fetched', data);
  } catch (err) {
    next(err);
  }
}
