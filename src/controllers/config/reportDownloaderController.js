// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const GeneralResponse = require('../../dto/commons/response/generalResponseDTO');
const reportDownloaderService = require('../../services/config/reportDownloaderService');
const httpCodes = require('../../utils/constants/httpCodes');
const generalResp = require('../../utils/responses/generalResp');

exports.createReport = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await reportDownloaderService.createReport(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    console.error(generalResponse.apiError.messageUser);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.get = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await reportDownloaderService.get(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    console.error(generalResponse.apiError.messageUser);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.getReport = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await reportDownloaderService.getReport(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    console.error(generalResponse.apiError.messageUser);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.getAllAllReports = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await reportDownloaderService.getAllAllReports(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    console.error(generalResponse.apiError.messageUser);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};
