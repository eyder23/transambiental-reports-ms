/* eslint-disable no-inner-declarations */
// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');
const Excel = require('exceljs');
const path = require('path');
const fs = require('fs');
const ApiError = require('../../dto/commons/response/apiErrorDTO');
const ServiceException = require('../../utils/errors/serviceException');
const commonErrors = require('../../utils/constants/commonErrors');
const reportGeneratorMessages = require('../../utils/constants/reportGeneratorMessages');
const Cliente = require('../../models/reports/ClienteModel');
const httpCodes = require('../../utils/constants/httpCodes');
const constants = require('../../utils/constants/constants');
const SummaryLoadedData = require('../../dto/summaryLoadedDataDTO');
const CommonLst = require('../../dto/commons/commonLstDTO');
const APIFeatures = require('../../utils/responses/apiFeatures');
const ReportUploader = require('../../models/config/reportUploaderModel');
const reportFunctionsUpdate = require('../../utils/functions/reportFunctionsUpdate');

// =========== Function to loadClients
exports.loadClients = async (req, res) => {
  try {
    this.loadClientsAsyncy(req, res);
    return 'El reporte está siendo Cargado. Por favor validar su estado';
  } catch (error) {
    throw error;
  }
};

exports.loadClientsAsyncy = async (req, res) => {
  try {
    // Defino objeto y variables estandar para el resumen de la carga
    const objectReportResume = {};
    objectReportResume.code = 'CLIENTESTM';
    objectReportResume.startDate = new Date();

    const reportInfo = await ReportUploader.find({
      code: objectReportResume.code
    }).lean();
    if (reportInfo.length === 0) {
      throw new ServiceException(
        commonErrors.E_COMMON_01,
        new ApiError(
          `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_06}`,
          `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_06}`,
          'E_REPORT_GENERATOR_MS_06',
          httpCodes.BAD_REQUEST
        )
      );
    }

    if (req.file === undefined) {
      // Actualizando información encabezado reporte
      objectReportResume.state = 'error_report';
      objectReportResume.percentageCompletition = 0;
      objectReportResume.counterRows = 0;
      objectReportResume.message = `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_01}`;
      objectReportResume.endDate = new Date();
      await reportFunctionsUpdate.updateReportUploader(objectReportResume);
      throw new ServiceException(
        commonErrors.E_COMMON_01,
        new ApiError(
          `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_01}`,
          `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_01}`,
          'E_REPORT_GENERATOR_MS_01',
          httpCodes.BAD_REQUEST
        )
      );
    }

    // Actualizando información encabezado reporte
    objectReportResume.state = 'processing';
    objectReportResume.percentageCompletition = 33;
    objectReportResume.counterRows = 0;
    objectReportResume.message = 'Procesando Información';
    objectReportResume.endDate = null;
    await reportFunctionsUpdate.updateReportUploader(objectReportResume);

    const pathTmp = path.resolve(__dirname, '../../resources/uploads/');
    const pathx = `${pathTmp}//${req.file.filename}`;
    const clients = [];
    let count = 0;
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(pathx).then(function() {
      const workSheet = workbook.getWorksheet(1);
      workSheet.eachRow(function(row, rowNumber) {
        const currRow = workSheet.getRow(rowNumber);
        if (count === 0) {
          const fileTitle = currRow.getCell(2).value;
          if (fileTitle !== constants.CLIENT_TEMPLATE_TITLE) {
            fs.unlink(pathx, function(err) {
              if (err) throw err;
            });

            async function finishReport() {
              // Actualizando información encabezado reporte
              objectReportResume.state = 'error_report';
              objectReportResume.percentageCompletition = 0;
              objectReportResume.counterRows = 0;
              objectReportResume.message = `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_02}`;
              objectReportResume.endDate = new Date();
              await reportFunctionsUpdate.updateReportUploader(
                objectReportResume
              );
            }
            finishReport();

            throw new ServiceException(
              commonErrors.E_COMMON_01,
              new ApiError(
                `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_02}`,
                `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_02}`,
                'E_REPORT_GENERATOR_MS_02',
                httpCodes.BAD_REQUEST
              )
            );
          }
        }
        // console.log(currRow.getCell(2).value);

        if (count > constants.CLIENT_TEMPLATE_ROW_INIT) {
          const client = {
            cliente: currRow.getCell(2).value,
            nombre: currRow.getCell(3).value,
            tipoNumeroIdentificacionFiscal: currRow.getCell(4).value,
            numeroIdentificacionFiscal: currRow.getCell(5).value,
            ciudad: currRow.getCell(6).value,
            estFedProv: currRow.getCell(7).value,
            direccion: currRow.getCell(8).value,
            paisRegion: currRow.getCell(9).value
          };
          clients.push(client);
        }
        count += 1;
      });
    });
    const summaryLoadedData = new SummaryLoadedData('', 0);
    console.log('Insert Data Init');
    // Actualizando información encabezado reporte
    objectReportResume.state = 'entering_information';
    objectReportResume.percentageCompletition = 66;
    objectReportResume.counterRows = 0;
    objectReportResume.message = 'Insertando Información';
    await reportFunctionsUpdate.updateReportUploader(objectReportResume);
    const countDB = await Cliente.countDocuments();
    await Cliente.collection
      .insertMany(clients)
      .then(function() {
        summaryLoadedData.message =
          reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
        summaryLoadedData.counter = clients.length + countDB;
        console.log('Insert Data Finish');
        async function finishReport() {
          // Actualizando información encabezado reporte
          objectReportResume.state = 'uploaded_data';
          objectReportResume.percentageCompletition = 100;
          objectReportResume.counterRows = clients.length + countDB;
          objectReportResume.message = 'Reporte cargado correctamente';
          objectReportResume.endDate = new Date();
          await reportFunctionsUpdate.updateReportUploader(objectReportResume);
        }
        finishReport();
      })
      .catch(function(error) {
        summaryLoadedData.message =
          reportGeneratorMessages.E_REPORT_GENERATOR_MS_03;
        console.log(error);
        async function finishReport() {
          // Actualizando información encabezado reporte
          objectReportResume.state = 'error_report';
          objectReportResume.percentageCompletition = 0;
          objectReportResume.counterRows = 0;
          objectReportResume.message =
            'Ocurrió un error al cargar el archivo. Por favor contácte a Soporte Técnico';
          objectReportResume.endDate = new Date();
          await reportFunctionsUpdate.updateReportUploader(objectReportResume);
        }
        finishReport();
      });
    fs.unlink(pathx, function(err) {
      if (err) throw err;
    });
    return summaryLoadedData;
  } catch (error) {
    throw error;
  }
};

// =========== Function to delete
exports.delete = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    await Cliente.deleteMany({ companyId: userInfo.companyId });
    // Defino objeto y variables estandar para el resumen de la carga
    const objectReportResume = {};
    objectReportResume.code = 'CLIENTESTM';
    objectReportResume.companyId = userInfo.companyId;
    objectReportResume.startDate = null;
    objectReportResume.state = 'deleted_report';
    objectReportResume.percentageCompletition = 0;
    objectReportResume.counterRows = 0;
    objectReportResume.message = 'Reporte borrado';
    objectReportResume.endDate = new Date();
    await reportFunctionsUpdate.updateReportUploader(objectReportResume);
    console.log('All Data successfully deleted');
    return true;
  } catch (err) {
    throw err;
  }
};

// =========== Function to count clients
exports.countClients = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    return await Cliente.countDocuments({ companyId: userInfo.companyId });
  } catch (err) {
    throw err;
  }
};

// =========== Function to get a specific Company
exports.getClient = async (req, res) => {
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
  const client = await Cliente.findById(req.params.id);
  // CompanyData.findOne({ _id: req.params.id })
  if (!client) {
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
  return client;
};

// =========== Function to get all Clients with filters to the table
exports.getAllClients = async (req, res) => {
  const userInfo = await userService.getUserInfo(req, res);
  const filterColumns = [
    'state',
    'client',
    'name',
    'address',
    'city',
    'email',
    'department',
    'identificationType',
    'identificationNumber',
    'country'
  ];
  const dataTable = new APIFeatures(Cliente.find(), req.query)
    .filter(userInfo.companyId, false, filterColumns)
    .sort()
    .limitFields()
    .paginate();
  const counter = new APIFeatures(Cliente.find(), req.query).filter(
    userInfo.companyId,
    true,
    filterColumns
  );
  const totalCount = await counter.query;
  const dataPaginate = await dataTable.query;
  const data = new CommonLst(totalCount, dataPaginate);

  return data;
};

exports.getAllTable = async req => {
  const features = new APIFeatures(Cliente.find(), req.query)
    .filterTable(
      'cliente',
      'nombre',
      'tipoNumeroIdentificacionFiscal',
      'numeroIdentificacionFiscal',
      'ciudad',
      'estFedProv',
      'direccion',
      'paisRegion'
    )
    .sort()
    .limitFields()
    .paginate();

  const featuresCounter = new APIFeatures(
    Cliente.countDocuments(),
    req.query
  ).filterTable(
    'cliente',
    'nombre',
    'tipoNumeroIdentificacionFiscal',
    'numeroIdentificacionFiscal',
    'ciudad',
    'estFedProv',
    'direccion',
    'paisRegion'
  );

  let total = 0;
  total = await featuresCounter.query.lean();
  if (total) {
    total = total.length || total || 0;
    if (Array.isArray(total)) {
      total = 0;
    }
  }
  const rows = await features.query.lean();

  if (total < 1) {
    throw new ServiceException(
      commonErrors.E_COMMON_01,
      new ApiError(
        `${commonErrors.EM_COMMON_15}`,
        `${commonErrors.EM_COMMON_15}`,
        'EM_COMMON_15',
        httpCodes.NOT_FOUND
      )
    );
  }
  const rowsList = new CommonLst(total, rows);
  return rowsList;
};
