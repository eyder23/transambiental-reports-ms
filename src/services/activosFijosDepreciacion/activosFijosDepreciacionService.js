/* eslint-disable no-inner-declarations */
// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const Excel = require('exceljs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');
const ApiError = require('../../dto/commons/response/apiErrorDTO');
const ServiceException = require('../../utils/errors/serviceException');
const commonErrors = require('../../utils/constants/commonErrors');
const reportGeneratorMessages = require('../../utils/constants/reportGeneratorMessages');
const ActivosFijosDepreciacion = require('../../models/reports/ActivosFijosDepreciacionModel');
const httpCodes = require('../../utils/constants/httpCodes');
const constants = require('../../utils/constants/constants');
const SummaryLoadedData = require('../../dto/summaryLoadedDataDTO');
const CommonLst = require('../../dto/commons/commonLstDTO');
const APIFeatures = require('../../utils/responses/apiFeatures');
const ReportUploader = require('../../models/config/reportUploaderModel');
const reportFunctionsUpdate = require('../../utils/functions/reportFunctionsUpdate');
const customValidator = require('../../utils/validators/validator');
const email = require('../../utils/email/senders/email');
const admz = require('adm-zip');
const userService = require('../config/userService');
const reportDownloaderService = require('../config/reportDownloaderService');
const ReportDownloader = require('../../models/config/reportDownloaderModel');
// Created By Eyder Ascuntar Rosales

// =========== Function to load
exports.load = async (req, res) => {
  try {
    this.loadAsyncy(req, res);
    return 'El reporte está siendo Cargado. Por favor validar su estado';
  } catch (error) {
    throw error;
  }
};

exports.loadAsyncy = async (req, res) => {
  try {
    // Defino objeto y variables estandar para el resumen de la carga
    const objectReportResume = {};
    objectReportResume.code = 'ACTIVOSFIJOSDEPREACIACIONTM';
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
    const rowsInsert = [];
    let count = 0;
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(pathx).then(function() {
      const workSheet = workbook.getWorksheet(1);
      workSheet.eachRow(function(row, rowNumber) {
        const currRow = workSheet.getRow(rowNumber);
        if (count === 0) {
          const fileTitle = currRow.getCell(2).value;
          if (
            fileTitle !== constants.ACTIVOS_FIJOS_DEPRECIACION_TEMPLATE_TITLE
          ) {
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

        if (count > constants.ACTIVOS_FIJOS_DEPRECIACION_ROW_INIT) {
          const rowInsert = {
            idClaseActivoFijo: currRow.getCell(2).value,
            nombreClaseActivoFijo: currRow.getCell(3).value,
            idActivoFijo: currRow.getCell(4).value,
            nombreActivoFijo: currRow.getCell(5).value,
            idCentroDeConste: currRow.getCell(6).value,
            nombreCentroDeConste: currRow.getCell(7).value,
            vidaUtilAnios: currRow.getCell(8).value,
            vidaUtilPeriodos: currRow.getCell(9).value,
            depreciacionPlanificada: currRow.getCell(10).value,
            depreciacionEspecialPlanificada: currRow.getCell(11).value,
            periodo: currRow.getCell(12).value.toString(),
            valorNetoContable: currRow.getCell(13).value,
            costesAdquisicion: currRow.getCell(14).value,
            bajas: currRow.getCell(15).value,
            transferencias: currRow.getCell(16).value,
            revaloraciones: currRow.getCell(17).value,
            depreciacionAcumulada: currRow.getCell(18).value,
            totalDepreciacion: currRow.getCell(19).value,
            depreciacionContabilizada: currRow.getCell(20).value
          };
          rowsInsert.push(rowInsert);
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
    const countDB = await ActivosFijosDepreciacion.countDocuments();
    await ActivosFijosDepreciacion.collection
      .insertMany(rowsInsert)
      .then(function() {
        summaryLoadedData.message =
          reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
        summaryLoadedData.counter = rowsInsert.length + countDB;
        console.log('Insert Data Finish');
        async function finishReport() {
          // Actualizando información encabezado reporte
          objectReportResume.state = 'uploaded_data';
          objectReportResume.percentageCompletition = 100;
          objectReportResume.counterRows = rowsInsert.length + countDB;
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
    await ActivosFijosDepreciacion.deleteMany();
    // Defino objeto y variables estandar para el resumen de la carga
    const objectReportResume = {};
    objectReportResume.code = 'ACTIVOSFIJOSDEPREACIACIONTM';
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

exports.getAll = async req => {
  let features = null;
  features = new APIFeatures(
    ActivosFijosDepreciacion.find()
      // .sort({ creadoEl: 1 })
      .lean(),
    req.query
  )
    .sort()
    .limitFields()
    .paginate();

  const featuresCounter = new APIFeatures(
    ActivosFijosDepreciacion.countDocuments(),
    req.query
  );
  const rows = await features.query.lean();

  let total = 0;
  total = await featuresCounter.query.lean();
  if (total) {
    total = total.length || total || 0;
    if (Array.isArray(total)) {
      total = 0;
    }
  }
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

exports.getAllAdvancedFilter = async req => {
  let isToDownload = false;
  if (req.body.isToDownload) {
    isToDownload = req.body.isToDownload;
  }
  let features = null;

  if (!isToDownload) {
    //MONTH-DAY-YEAR
    features = new APIFeatures(
      ActivosFijosDepreciacion.find()
        // .sort({ creadoEl: 1 })
        .lean(),
      req.query
    )
      .findByExact('nombreClaseActivoFijo', req.body.nombreClaseActivoFijo)
      .findByExact('nombreActivoFijo', req.body.nombreActivoFijo)
      .findByExact('periodo', req.body.periodo)
      .limitFields()
      .paginate(req.body.page, req.body.limit);

    const featuresCounter = new APIFeatures(
      ActivosFijosDepreciacion.countDocuments(),
      req.query
    )
      .findByExact('nombreClaseActivoFijo', req.body.nombreClaseActivoFijo)
      .findByExact('nombreActivoFijo', req.body.nombreActivoFijo)
      .findByExact('periodo', req.body.periodo);

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
  } else {
    features = new APIFeatures(
      ActivosFijosDepreciacion.find()
        // .sort({ creadoEl: 1 })
        .lean(),
      req.query
    )
      .findByExact('nombreClaseActivoFijo', req.body.nombreClaseActivoFijo)
      .findByExact('nombreActivoFijo', req.body.nombreActivoFijo)
      .findByExact('periodo', req.body.periodo);

    req.body.features = features;
    req.body.reportType = 'FILTER';
    this.sendReportToEmail(req);
    return 'El reporte está siendo Generado. Se enviará a su bandeja de correo al completar el proceso.';
  }
};

exports.sendReportToEmail = async (req, res) => {
  const objectReportResume = {};
  try {
    objectReportResume.code = 'ACTIVOSFIJOSDEPREACIACIONTM';
    objectReportResume.startDate = new Date();
    objectReportResume.reportType = req.body.reportType;
    const reportType = req.body.reportType === 'GLOBAL' ? 'GLOBAL' : 'FILTRADO';

    let userInfo = await userService.validateUser(req, res);
    objectReportResume.generatorUserId = userInfo.uid;
    const features = req.body.features;

    console.log(
      '>>>>>>>>>>>>  Empezando proceso carga de data en memoria',
      new Date()
    );

    let reportInfo = null;
    reportInfo = await ReportDownloader.findOne({
      code: objectReportResume.code,
      generatorUserId: objectReportResume.generatorUserId,
      reportType: objectReportResume.reportType
    }).lean();
    if (!reportInfo) {
      reportInfo = await reportDownloaderService.createReportByUser({
        name: 'Activos Fijos Depreciacion',
        code: objectReportResume.code,
        generatorUserId: objectReportResume.generatorUserId,
        reportType: objectReportResume.reportType
      });
    }

    // Actualizando información encabezado reporte
    objectReportResume.state = 'loading_in_memory_started';
    objectReportResume.percentageCompletition = 10;
    objectReportResume.counterRows = 0;
    objectReportResume.message = 'Proceso carga de información en memoria';
    objectReportResume.endDate = null;
    await reportFunctionsUpdate.updateReportDownloader(objectReportResume);

    let reportData = await features.query
      // .sort({
      //   creadoEl: 1
      // })
      // .limit(100)
      .lean();

    let zp = new admz();

    console.log(
      '>>>>>>>>>>>>  Finalizando proceso carga de data en memoria',
      new Date()
    );
    const nameFile = 'ACTIVOS_FIJOS_DEPRECIACION';
    const pathTmp = path.resolve(__dirname, '../../resources/uploads/');
    const genCode = Math.floor(100000 + Math.random() * 900000);
    const pathx = `${pathTmp}/${nameFile}-${genCode}.csv`;

    const csvWriter = createCsvWriter({
      path: pathx,
      fieldDelimiter: ';',
      header: [
        {
          id: 'idClaseActivoFijo',
          title: 'ID Clase Activo Fijo'
        },
        {
          id: 'nombreClaseActivoFijo',
          title: 'Clase Activo Fijo'
        },
        {
          id: 'idActivoFijo',
          title: 'ID Activo Fijo'
        },
        {
          id: 'nombreActivoFijo',
          title: 'Nombre Activo Fijo'
        },
        {
          id: 'idCentroDeConste',
          title: 'ID Centro de Coste'
        },
        {
          id: 'nombreCentroDeConste',
          title: 'Nombre Centro de Coste'
        },
        {
          id: 'vidaUtilAnios',
          title: 'Vida Util en Años'
        },
        {
          id: 'vidaUtilPeriodos',
          title: 'Viud Util en Periodos'
        },
        {
          id: 'depreciacionPlanificada',
          title: 'Depreciación Planificada'
        },
        {
          id: 'depreciacionEspecialPlanificada',
          title: 'Depreciación Especial Planificada'
        },
        {
          id: 'periodo',
          title: 'Periodo'
        },
        {
          id: 'valorNetoContable',
          title: 'Valo Neto Contable'
        },
        {
          id: 'costesAdquisicion',
          title: 'Costes Adquisición'
        },
        {
          id: 'bajas',
          title: 'Bajas'
        },
        {
          id: 'transferencias',
          title: 'Transferencias'
        },
        {
          id: 'revaloraciones',
          title: 'Revaloraciones'
        },
        {
          id: 'depreciacionAcumulada',
          title: 'Depreciación Acumulada'
        },
        {
          id: 'totalDepreciacion',
          title: 'Total Depreciación'
        },
        {
          id: 'depreciacionContabilizada',
          title: 'Depreciación Contabilizada'
        }
      ]
    });

    const reportLength = reportData.length;
    objectReportResume.state = 'formating_data';
    objectReportResume.percentageCompletition = 50;
    objectReportResume.counterRows = reportLength;
    objectReportResume.message = 'Asignando formato a los datos';
    objectReportResume.endDate = null;
    await reportFunctionsUpdate.updateReportDownloader(objectReportResume);

    reportData.forEach(function(cursor, index, object) {
      cursor.depreciacionPlanificada = customValidator.stringFromDate(
        cursor.depreciacionPlanificada
      );

      cursor.depreciacionEspecialPlanificada = customValidator.numberToStringDecimal(
        cursor.depreciacionEspecialPlanificada
      );
      cursor.valorNetoContable = customValidator.numberToStringDecimal(
        cursor.valorNetoContable
      );
      cursor.costesAdquisicion = customValidator.numberToStringDecimal(
        cursor.costesAdquisicion
      );
      cursor.bajas = customValidator.numberToStringDecimal(cursor.bajas);

      cursor.transferencias = customValidator.numberToStringDecimal(
        cursor.transferencias
      );
      cursor.revaloraciones = customValidator.numberToStringDecimal(
        cursor.revaloraciones
      );
      cursor.depreciacionAcumulada = customValidator.numberToStringDecimal(
        cursor.depreciacionAcumulada
      );
      cursor.totalDepreciacion = customValidator.numberToStringDecimal(
        cursor.totalDepreciacion
      );
      cursor.depreciacionContabilizada = customValidator.numberToStringDecimal(
        cursor.depreciacionContabilizada
      );
    });

    let writerPromise = null;
    if (reportLength < 11) {
      writerPromise = Promise.resolve().then(() =>
        csvWriter.writeRecords(reportData)
      );
    } else {
      const n = 10;
      const result = [[], [], [], [], [], [], [], [], [], []]; //we create it, then we'll fill it
      const wordsPerLine = Math.ceil(reportData.length / n);

      objectReportResume.state = 'writing_in_file_started';
      objectReportResume.percentageCompletition = 60;
      objectReportResume.message = 'Escritura de archivo iniciada';
      objectReportResume.endDate = null;
      await reportFunctionsUpdate.updateReportDownloader(objectReportResume);
      console.log(
        '>>>>>>>>>>>>=========== EMPEZANDO A PARTIR EL OBJETO',
        new Date()
      );
      for (let line = 0; line < n; line++) {
        for (let i = 0; i < wordsPerLine; i++) {
          const value = reportData[i + line * wordsPerLine];
          if (!value) continue; //avoid adding "undefined" values
          result[line].push(value);
        }
      }
      reportData = null;
      console.log(
        '>>>>>>>>>>>>=========== TERMINÉ DE PARTIR EL OBJETO',
        new Date()
      );

      console.log(
        '>>>>>>>>>>>>=========== EMPEZANDO A ESCRIBIR EN ARCHIVO',
        new Date()
      );
      writerPromise = Promise.resolve()
        .then(() => csvWriter.writeRecords(result[0]))
        .then(() => csvWriter.writeRecords(result[1]))
        .then(() => csvWriter.writeRecords(result[2]))
        .then(() => csvWriter.writeRecords(result[3]))
        .then(() => csvWriter.writeRecords(result[4]))
        .then(() => csvWriter.writeRecords(result[5]))
        .then(() => csvWriter.writeRecords(result[6]))
        .then(() => csvWriter.writeRecords(result[7]))
        .then(() => csvWriter.writeRecords(result[8]))
        .then(() => csvWriter.writeRecords(result[9]));
    }

    writerPromise.then(value => {
      try {
        console.log(
          '>>>>>>>>>>>>=========== TERMINÉ DE ESCRIBIR EN ARCHIVO',
          new Date()
        );
        console.log('voy a enviar el archivo');

        async function finishReport() {
          // Actualizando información encabezado reporte
          objectReportResume.state = 'write_in_file_finished';
          objectReportResume.percentageCompletition = 80;
          objectReportResume.message = 'Escritura de archivo finalizada';
          objectReportResume.endDate = new Date();
          await reportFunctionsUpdate.updateReportDownloader(
            objectReportResume
          );
        }
        finishReport();

        zp.addLocalFile(pathx);
        const fileDef = `${pathTmp}/${nameFile + '-' + genCode}.zip`;
        zp.writeZip(fileDef);

        let message = '';
        try {
          message = fs.readFileSync(
            path.resolve(
              __dirname,
              '../../utils/email/templates/reportGenerator.html'
            ),
            'utf8'
          );
          message = message.replace('$#$#$#USER#$#$#$', `${userInfo.name} `);
          message = message.replace('$#$#$#REPORT_NAME#$#$#$', `${nameFile}`);
          message = message.replace('$#$#$#REPORT_TYPE#$#$#$', `${reportType}`);
        } catch (err) {
          console.error(err);
        }

        async function sendEmail() {
          try {
            await email.sendEmailWithAttachments({
              email: userInfo.email,
              subject: 'Generación de Reportes',
              message: message,
              path: fileDef,
              pathOriginal: pathx
            });

            // Actualizando información encabezado reporte
            objectReportResume.state = 'email_send';
            objectReportResume.percentageCompletition = 100;
            objectReportResume.message =
              'Reporte enviado a correo electrónico del usuario';
            objectReportResume.endDate = new Date();
            await reportFunctionsUpdate.updateReportDownloader(
              objectReportResume
            );
          } catch (error) {
            async function finishReport() {
              // Actualizando información encabezado reporte
              objectReportResume.state = 'error_gen_report';
              objectReportResume.percentageCompletition = 80;
              objectReportResume.message = error.message;
              objectReportResume.endDate = new Date();
              await reportFunctionsUpdate.updateReportDownloader(
                objectReportResume
              );
            }
            finishReport();
            throw error;
          }
        }
        sendEmail();
      } catch (error) {
        throw error;
      }
    });

    return true;
  } catch (error) {
    console.log(error);
    if (error.apiError) {
      objectReportResume.message = error.apiError.messageDeveloper;
    } else {
      objectReportResume.message =
        'Error indeterminado. Contacte a soporte técnico';
    }
    objectReportResume.state = 'error_gen_report';
    objectReportResume.percentageCompletition = 0;
    objectReportResume.endDate = null;
    await reportFunctionsUpdate.updateReportDownloader(objectReportResume);
    // throw error;
  }
};
