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
const AntiguedadCuentasPorCobrar = require('../../models/reports/AntiguedadCuentasPorCobrarModel');
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
    objectReportResume.code = 'ANTIGUEDADCUENTASPORCOBRARTM';
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
            fileTitle !== constants.ANTIGUEDAD_CUENTAS_POR_COBRAR_TEMPLATE_TITLE
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

        if (count > constants.ANTIGUEDAD_CUENTAS_POR_COBRAR_ROW_INIT) {
          const rowInsert = {
            idCliente: currRow.getCell(2).value,
            nombreCliente: currRow.getCell(3).value,
            asientoContable: currRow.getCell(4).value,
            fechaContabilizacion: customValidator.dateFromString(
              currRow.getCell(5).value
            ),
            fechaDocumento: customValidator.dateFromString(
              currRow.getCell(6).value
            ),
            idDocumento: currRow.getCell(7).value,
            tipoDocumento: currRow.getCell(8).value,
            importeAtrasado: currRow.getCell(9).value,
            _1_30_dias: currRow.getCell(10).value,
            _31_60_dias: currRow.getCell(11).value,
            _61_90_dias: currRow.getCell(12).value,
            _91_120_dias: currRow.getCell(13).value,
            _mas_120_dias: currRow.getCell(14).value,
            importePendiente: currRow.getCell(15).value,
            importeNoVencido: currRow.getCell(16).value,
            mesPeriodo: currRow.getCell(17).value?.toString(),
            anioPeriodo: currRow.getCell(18).value?.toString()
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
    const countDB = await AntiguedadCuentasPorCobrar.countDocuments();
    await AntiguedadCuentasPorCobrar.collection
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
    await AntiguedadCuentasPorCobrar.deleteMany();
    // Defino objeto y variables estandar para el resumen de la carga
    const objectReportResume = {};
    objectReportResume.code = 'ANTIGUEDADCUENTASPORCOBRARTM';
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
    AntiguedadCuentasPorCobrar.find()
      // .sort({ fechaContabilizacion: 1 })
      .lean(),
    req.query
  )
    .sort()
    .limitFields()
    .paginate();

  const featuresCounter = new APIFeatures(
    AntiguedadCuentasPorCobrar.countDocuments(),
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
      AntiguedadCuentasPorCobrar.find()
        // .sort({ fechaContabilizacion: 1 })
        .lean(),
      req.query
    )
      .filterTableAdvancedFilterDate(
        'fechaContabilizacion',
        req.body.fechaContabilizacionInit,
        req.body.fechaContabilizacionEnd
      )
      .findByExact('idCliente', req.body.idCliente)
      .findByExact('idDocumento', req.body.idDocumento)
      .findByExactNoLike('mesPeriodo', req.body.mesPeriodo)
      .findByExactNoLike('anioPeriodo', req.body.anioPeriodo)
      .limitFields()
      .paginate(req.body.page, req.body.limit);

    const featuresCounter = new APIFeatures(
      AntiguedadCuentasPorCobrar.countDocuments(),
      req.query
    )
      .filterTableAdvancedFilterDate(
        'fechaContabilizacion',
        req.body.fechaContabilizacionInit,
        req.body.fechaContabilizacionEnd
      )
      .findByExact('idCliente', req.body.idCliente)
      .findByExact('idDocumento', req.body.idDocumento)
      .findByExactNoLike('mesPeriodo', req.body.mesPeriodo)
      .findByExactNoLike('anioPeriodo', req.body.anioPeriodo);

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
      AntiguedadCuentasPorCobrar.find()
        // .sort({ fechaContabilizacion: 1 })
        .lean(),
      req.query
    )
      .filterTableAdvancedFilterDate(
        'fechaContabilizacion',
        req.body.fechaContabilizacionInit,
        req.body.fechaContabilizacionEnd
      )
      .findByExact('idCliente', req.body.idCliente)
      .findByExact('idDocumento', req.body.idDocumento)
      .findByExactNoLike('mesPeriodo', req.body.mesPeriodo)
      .findByExactNoLike('anioPeriodo', req.body.anioPeriodo);

    req.body.features = features;
    req.body.reportType = 'FILTER';
    this.sendReportToEmail(req);
    return 'El reporte está siendo Generado. Se enviará a su bandeja de correo al completar el proceso.';
  }
};

exports.sendReportToEmail = async (req, res) => {
  const objectReportResume = {};
  try {
    objectReportResume.code = 'ANTIGUEDADCUENTASPORCOBRARTM';
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
        name: 'Antiguedad de Cuentas por Cobrar',
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
      //   fechaContabilizacion: 1
      // })
      // .limit(100)
      .lean();

    let zp = new admz();

    console.log(
      '>>>>>>>>>>>>  Finalizando proceso carga de data en memoria',
      new Date()
    );
    const nameFile = 'ANTIGUEDAD_DE_CUENTAS_POR_COBRAR';
    const pathTmp = path.resolve(__dirname, '../../resources/uploads/');
    const genCode = Math.floor(100000 + Math.random() * 900000);
    const pathx = `${pathTmp}/${nameFile}-${genCode}.csv`;

    const csvWriter = createCsvWriter({
      path: pathx,
      fieldDelimiter: ';',
      header: [
        {
          id: 'idCliente',
          title: 'ID cliente'
        },
        {
          id: 'nombreCliente',
          title: 'Nombre cliente'
        },
        {
          id: 'asientoContable',
          title: 'Asiento contable'
        },
        {
          id: 'fechaContabilizacion',
          title: 'Fecha contabilización'
        },
        {
          id: 'fechaDocumento',
          title: 'Fecha documento'
        },
        {
          id: 'idDocumento',
          title: 'ID documento'
        },
        {
          id: 'tipoDocumento',
          title: 'Tipo documento'
        },
        {
          id: 'importeAtrasado',
          title: 'Importe atrasado'
        },
        {
          id: '_1_30_dias',
          title: '1 a 30 dias'
        },
        {
          id: '_31_60_dias',
          title: '31 a 60 dias'
        },
        {
          id: '_61_90_dias',
          title: '61 a 90 dias'
        },
        {
          id: '_91_120_dias',
          title: '91 a 120 dias'
        },
        {
          id: '_mas_120_dias',
          title: '> 120 dias'
        },
        {
          id: 'importePendiente',
          title: 'Importe pendiente'
        },
        {
          id: 'importeNoVencido',
          title: 'Importe no vencido'
        },
        {
          id: 'mesPeriodo',
          title: 'Mes Periodo'
        },
        {
          id: 'anioPeriodo',
          title: 'Año Periodo'
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
      cursor.fechaContabilizacion = customValidator.stringFromDate(
        cursor.fechaContabilizacion
      );
      cursor.fechaDocumento = customValidator.stringFromDate(
        cursor.fechaDocumento
      );
      cursor.importeAtrasado = customValidator.numberToStringDecimal(
        cursor.importeAtrasado
      );
      cursor._1_30_dias = customValidator.numberToStringDecimal(
        cursor._1_30_dias
      );
      cursor._31_60_dias = customValidator.numberToStringDecimal(
        cursor._31_60_dias
      );
      cursor._61_90_dias = customValidator.numberToStringDecimal(
        cursor._61_90_dias
      );
      cursor._91_120_dias = customValidator.numberToStringDecimal(
        cursor._91_120_dias
      );
      cursor._mas_120_dias = customValidator.numberToStringDecimal(
        cursor._mas_120_dias
      );
      cursor.importePendiente = customValidator.numberToStringDecimal(
        cursor.importePendiente
      );
      cursor.importeNoVencido = customValidator.numberToStringDecimal(
        cursor.importeNoVencido
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
