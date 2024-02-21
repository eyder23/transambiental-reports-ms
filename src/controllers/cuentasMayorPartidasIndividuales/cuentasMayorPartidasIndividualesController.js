// Created By Eyder Ascuntar Rosales
const GeneralResponse = require('../../dto/commons/response/generalResponseDTO');
const service = require('../../services/cuentasMayorPartidasIndividuales/cuentasMayorPartidasIndividualesService');
const httpCodes = require('../../utils/constants/httpCodes');
const generalResp = require('../../utils/responses/generalResp');
const fileDownloadName = 'CUENTAS_DE_MAYOR_PARTIDAS_INDIVIDUALES.zip';

exports.load = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await service.load(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    console.error(generalResponse.apiError.messageUser);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.delete = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await service.delete(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.getAll = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await service.getAll(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.getAllAdvancedFilter = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await service.getAllAdvancedFilter(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.downloadGlobalReport = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await service.downloadGlobalReport(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

// ========================== PARA SU USO EN UN FUTURO
// exports.downloadReport = async (req, res) => {
//   let codeHttp = httpCodes.OK;
//   let generalResponse = new GeneralResponse();
//   generalResponse.success = true;
//   try {
//     const data = await service.downloadReport(req, res);
//     // generalResponse = generalResp.generalSuccess(data);
//     res.set('Content-Type', 'application/octet-stream');
//     res.set('Content-Disposition', `attachment; filename=${fileDownloadName}`);
//     res.set('Content-Length', data.length);
//     res.send(data);
//   } catch (err) {
//     generalResponse = generalResp.generalError(err);
//     codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
//     generalResponse.apiError.codeHTTP = undefined;
//     return res.status(codeHttp).json(generalResponse);
//   }
// };
