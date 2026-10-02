import * as reportRepo from './report.repository.js';
import { NotFoundError } from '../../shared/errors/app-error.js';

const REPORT_TYPES = {
  OVERALL: 'OVERALL',
  EMPLOYEE_WISE: 'EMPLOYEE_WISE',
  DEPARTMENT_WISE: 'DEPARTMENT_WISE',
  LEAVE_TYPE_WISE: 'LEAVE_TYPE_WISE'
};

export async function generateReport(reportType, month, generatedBy) {
  let reportData;

  switch (reportType) {
    case REPORT_TYPES.OVERALL:
      reportData = await reportRepo.getOverallSummary(month);
      break;
    case REPORT_TYPES.EMPLOYEE_WISE:
      reportData = await reportRepo.getEmployeeWiseSummary(month);
      break;
    case REPORT_TYPES.DEPARTMENT_WISE:
      reportData = await reportRepo.getDepartmentWiseSummary(month);
      break;
    case REPORT_TYPES.LEAVE_TYPE_WISE:
      reportData = await reportRepo.getLeaveTypeWiseSummary(month);
      break;
    default:
      reportData = {};
  }

  const id = await reportRepo.create({
    reportType,
    reportMonth: month,
    reportData,
    generatedBy
  });

  return reportRepo.findById(id);
}

export async function getReports(query) {
  return reportRepo.findAll(query);
}

export async function getReportById(id) {
  const report = await reportRepo.findById(id);
  if (!report) throw new NotFoundError('Report not found');
  return report;
}

export async function getOverallSummary(month) {
  return reportRepo.getOverallSummary(month);
}

export async function getEmployeeWiseSummary(month) {
  return reportRepo.getEmployeeWiseSummary(month);
}

export async function getDepartmentWiseSummary(month) {
  return reportRepo.getDepartmentWiseSummary(month);
}

export async function getLeaveTypeWiseSummary(month) {
  return reportRepo.getLeaveTypeWiseSummary(month);
}
