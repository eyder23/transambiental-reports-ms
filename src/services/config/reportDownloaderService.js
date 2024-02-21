/* eslint-disable no-restricted-syntax */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-continue */
// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS

const mongoose = require('mongoose');
const ApiError = require('../../dto/commons/response/apiErrorDTO');
const ServiceException = require('../../utils/errors/serviceException');
const commonErrors = require('../../utils/constants/commonErrors');
const ReportDownloader = require('../../models/config/reportDownloaderModel');
const customValidator = require('../../utils/validators/validator');
const httpCodes = require('../../utils/constants/httpCodes');
const APIFeatures = require('../../utils/responses/apiFeatures');

// =========== Function to register a new user
exports.createReport = async (req, res) => {
  try {
    // Validate request
    customValidator.validateNotNullRequest(req);
    const report = await ReportDownloader.insertMany(req.body);
    return report;
  } catch (error) {
    throw error;
  }
};

exports.createReportByUser = async reportIn => {
  try {
    // Validate
    let report = null;
    report = await ReportDownloader.findOne({
      code: reportIn.code,
      generatorUserId: reportIn.generatorUserId,
      reportType: reportIn.reportType
    }).lean();
    if (!report) {
      report = await ReportDownloader.insertMany(reportIn);
    }
    return report;
  } catch (error) {
    throw error;
  }
};

exports.get = async (req, res) => {
  const features = new APIFeatures(ReportDownloader.find(), req.query).filter();
  const reports = await features.query.lean();
  if (reports && reports.length > 0) {
    return reports;
  } else {
    throw new ServiceException(
      commonErrors.EM_COMMON_15,
      new ApiError(
        `${commonErrors.EM_COMMON_15}`,
        `${commonErrors.EM_COMMON_15}`,
        'EM_COMMON_07',
        httpCodes.BAD_REQUEST
      )
    );
  }
};

// =========== Function to get a specific
exports.getReport = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ServiceException(
      commonErrors.E_COMMON_01,
      new ApiError(
        `${commonErrors.EM_COMMON_10}`,
        `${commonErrors.EM_COMMON_10}`,
        'EM_COMMON_10',
        httpCodes.BAD_REQUEST
      )
    );
  }
  const data = await ReportDownloader.findById(req.params.id);
  // CompanyData.findOne({ _id: req.params.id })
  if (!data) {
    throw new ServiceException(
      commonErrors.E_COMMON_01,
      new ApiError(
        `${commonErrors.EM_COMMON_11}`,
        `${commonErrors.EM_COMMON_11}`,
        'EM_COMMON_11',
        httpCodes.BAD_REQUEST
      )
    );
  }
  return data;
};
