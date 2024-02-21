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
const CuentasDeMayorPartidasIndividuales = require('../../models/reports/CuentasDeMayorPartidasIndividualesModel');
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
    objectReportResume.code = 'CUENTASMAYORPARTIDASINDIVIDUALESTM';
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
            fileTitle !==
            constants.CUENTAS_MAYOR_PARTIDAS_INDIVIDUALES_TEMPLATE_TITLE
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

        if (count > constants.CUENTAS_MAYOR_PARTIDAS_INDIVIDUALES_ROW_INIT) {
          const rowInsert = {
            idCuentaDeMayor: currRow.getCell(2).value,
            nombreCuentaDeMayor: currRow.getCell(3).value,
            fechaContabilizacion: customValidator.dateFromString(
              currRow.getCell(4).value
            ),
            asientoContable: currRow.getCell(5).value,
            textoCabecera: currRow.getCell(6).value,
            posicionAsientoContable: currRow.getCell(7).value,
            textoPosicion: currRow.getCell(8).value,
            tipoAsientoContable: currRow.getCell(9).value,
            idDocumentoOriginal: currRow.getCell(10).value,
            ejercicioFiscal: currRow.getCell(11).value,
            idCentroCostos: currRow.getCell(12).value,
            nombreCentroCostos: currRow.getCell(13).value,
            idCentroBeneficio: currRow.getCell(14).value,
            nombreCentroBeneficio: currRow.getCell(15).value,
            idActivoFijo: currRow.getCell(16).value,
            nombreActivoFijo: currRow.getCell(17).value,
            idActivo: currRow.getCell(18).value,
            nombreActivo: currRow.getCell(19).value,
            idClaseActivoFijo: currRow.getCell(20).value,
            nombreClaseActivoFijo: currRow.getCell(21).value,
            asientoContableAnulado: currRow.getCell(22).value,
            textoCabeceraACA: currRow.getCell(23).value,
            asientoContableDeAnulacion: currRow.getCell(24).value,
            textoCabeceraACDA: currRow.getCell(25).value,
            idClienteProveedorContrapartida: currRow.getCell(26).value,
            nombreClienteProveedorContrapartida: currRow.getCell(27).value,
            idSocioComercial: currRow.getCell(28).value,
            nombreSocioComercial: currRow.getCell(29).value,
            importeDebeMonedaEmpresa: currRow.getCell(30).value,
            importeHaberMonedaEmpresa: currRow.getCell(31).value,
            saldoMonedaEmpresa: currRow.getCell(32).value,
            importeDebeMonedaTransaccion: currRow.getCell(33).value,
            importeHaberMonedaTransaccion: currRow.getCell(34).value,
            saldoMonedaTransaccion: currRow.getCell(35).value
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
    const countDB = await CuentasDeMayorPartidasIndividuales.countDocuments();
    await CuentasDeMayorPartidasIndividuales.collection
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
    await CuentasDeMayorPartidasIndividuales.deleteMany();
    // Defino objeto y variables estandar para el resumen de la carga
    const objectReportResume = {};
    objectReportResume.code = 'CUENTASMAYORPARTIDASINDIVIDUALESTM';
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
  let isToDownload = false;
  if (req.query.isToDownload) {
    isToDownload = JSON.parse(req.query.isToDownload);
  }
  let features = null;

  const filterFields = [
    'idCuentaDeMayor',
    'nombreCuentaDeMayor',
    'asientoContable',
    'textoCabecera',
    'posicionAsientoContable',
    'textoPosicion',
    'tipoAsientoContable',
    'idDocumentoOriginal',
    'ejercicioFiscal',
    'idCentroCostos',
    'nombreCentroCostos',
    'idCentroBeneficio',
    'nombreCentroBeneficio',
    'idActivoFijo',
    'nombreActivoFijo',
    'idActivo',
    'nombreActivo',
    'idClaseActivoFijo',
    'nombreClaseActivoFijo',
    'asientoContableAnulado',
    'textoCabeceraACA',
    'asientoContableDeAnulacion',
    'textoCabeceraACDA',
    'idClienteProveedorContrapartida',
    'nombreClienteProveedorContrapartida',
    'idSocioComercial',
    'nombreSocioComercial',
    'importeDebeMonedaEmpresa',
    'importeHaberMonedaEmpresa',
    'saldoMonedaEmpresa',
    'importeDebeMonedaTransaccion',
    'importeHaberMonedaTransaccion',
    'saldoMonedaTransaccion'
  ];

  if (!isToDownload) {
    features = new APIFeatures(
      CuentasDeMayorPartidasIndividuales.find()
        // .sort({ fechaContabilizacion: 1 })
        .lean(),
      req.query
    )
      .filterTable(filterFields)
      .sort()
      .limitFields()
      .paginate();

    const featuresCounter = new APIFeatures(
      CuentasDeMayorPartidasIndividuales.countDocuments(),
      req.query
    ).filterTable(filterFields);
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
  } else {
    features = new APIFeatures(
      CuentasDeMayorPartidasIndividuales.find()
        // .sort({ fechaContabilizacion: 1 })
        .lean(),
      req.query
    ).filterTable(filterFields);
    // console.log(features);
    req.body.features = features;
    req.body.reportType = 'GLOBAL';
    this.sendReportToEmail(req);
    return 'El reporte está siendo Generado. Se enviará a su bandeja de correo al completar el proceso.';
  }
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
      CuentasDeMayorPartidasIndividuales.find()
        // .sort({ fechaContabilizacion: 1 })
        .lean(),
      req.query
    )
      .filterTableAdvancedFilterDate(
        'fechaContabilizacion',
        req.body.fechaContabilizacionInit,
        req.body.fechaContabilizacionEnd
      )
      .findByExact('idCuentaDeMayor', req.body.idCuentaDeMayor)
      .findByExact('asientoContable', req.body.asientoContable)
      .findByExact(
        'nombreClienteProveedorContrapartida',
        req.body.nombreClienteProveedorContrapartida
      )
      .findByExact('nombreSocioComercial', req.body.nombreSocioComercial)
      .findByExact('ejercicioFiscal', req.body.ejercicioFiscal)
      // .sortCustom('fechaFactura')
      .limitFields()
      .paginate(req.body.page, req.body.limit);

    const featuresCounter = new APIFeatures(
      CuentasDeMayorPartidasIndividuales.countDocuments(),
      req.query
    )
      .filterTableAdvancedFilterDate(
        'fechaContabilizacion',
        req.body.fechaContabilizacionInit,
        req.body.fechaContabilizacionEnd
      )
      .findByExact('idCuentaDeMayor', req.body.idCuentaDeMayor)
      .findByExact('asientoContable', req.body.asientoContable)
      .findByExact(
        'nombreClienteProveedorContrapartida',
        req.body.nombreClienteProveedorContrapartida
      )
      .findByExact('nombreSocioComercial', req.body.nombreSocioComercial)
      .findByExact('ejercicioFiscal', req.body.ejercicioFiscal);
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
      CuentasDeMayorPartidasIndividuales.find()
        // .sort({ fechaContabilizacion: 1 })
        .lean(),
      req.query
    )
      .filterTableAdvancedFilterDate(
        'fechaContabilizacion',
        req.body.fechaContabilizacionInit,
        req.body.fechaContabilizacionEnd
      )
      .findByExact('idCuentaDeMayor', req.body.idCuentaDeMayor)
      .findByExact('asientoContable', req.body.asientoContable)
      .findByExact(
        'nombreClienteProveedorContrapartida',
        req.body.nombreClienteProveedorContrapartida
      )
      .findByExact('nombreSocioComercial', req.body.nombreSocioComercial)
      .findByExact('ejercicioFiscal', req.body.ejercicioFiscal);

    req.body.features = features;
    req.body.reportType = 'FILTER';
    this.sendReportToEmail(req);
    return 'El reporte está siendo Generado. Se enviará a su bandeja de correo al completar el proceso.';
  }
};

exports.downloadGlobalReport = async (req, res) => {
  try {
    this.sendReportToEmail(req, res);
    return 'El reporte está siendo Generado. Se enviará a su bandeja de correo al completar el proceso.';
  } catch (error) {
    throw error;
  }
};

exports.sendReportToEmail = async (req, res) => {
  const objectReportResume = {};
  try {
    objectReportResume.code = 'CUENTASMAYORPARTIDASINDIVIDUALESTM';
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
        name: 'Cuentas de Mayor Partidas Individuales',
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
    const nameFile = 'CUENTAS_DE_MAYOR_PARTIDAS_INDIVIDUALES';
    const pathTmp = path.resolve(__dirname, '../../resources/uploads/');
    const genCode = Math.floor(100000 + Math.random() * 900000);
    const pathx = `${pathTmp}/${nameFile}-${genCode}.csv`;

    const csvWriter = createCsvWriter({
      path: pathx,
      fieldDelimiter: ';',
      header: [
        {
          id: 'idCuentaDeMayor',
          title: 'ID Cuenta de mayor'
        },
        {
          id: 'nombreCuentaDeMayor',
          title: 'Nombre Cuenta de mayor'
        },
        {
          id: 'fechaContabilizacion',
          title: 'Fecha de contabilización'
        },
        {
          id: 'asientoContable',
          title: 'Asiento contable'
        },
        {
          id: 'textoCabecera',
          title: 'Texto de cabecera'
        },
        {
          id: 'posicionAsientoContable',
          title: 'Posición de asiento contable'
        },
        {
          id: 'textoPosicion',
          title: 'Texto de posición'
        },
        {
          id: 'tipoAsientoContable',
          title: 'Tipo de asiento contable'
        },
        {
          id: 'idDocumentoOriginal',
          title: 'ID doc.original'
        },
        {
          id: 'ejercicioFiscal',
          title: 'Ejercicio fiscal'
        },
        {
          id: 'idCentroCostos',
          title: 'ID Centro de costos'
        },
        {
          id: 'nombreCentroCostos',
          title: 'Nombre centro de costos'
        },
        {
          id: 'idCentroBeneficio',
          title: 'Centro de beneficio'
        },
        {
          id: 'nombreCentroBeneficio',
          title: 'Nombre centro de beneficio'
        },
        {
          id: 'idActivoFijo',
          title: 'ID activo fijo'
        },
        {
          id: 'nombreActivoFijo',
          title: 'Nombre activo fijo'
        },
        {
          id: 'idActivo',
          title: 'ID activo'
        },
        {
          id: 'nombreActivo',
          title: 'Nombre activo'
        },
        {
          id: 'idClaseActivoFijo',
          title: 'ID Clase de activo fijo'
        },
        {
          id: 'nombreClaseActivoFijo',
          title: 'Nombre Clase de Activo'
        },
        {
          id: 'asientoContableAnulado',
          title: 'Asiento contable anulado'
        },
        {
          id: 'textoCabeceraACA',
          title: 'Texto de cabecera'
        },
        {
          id: 'asientoContableDeAnulacion',
          title: 'Asiento contable de anulación'
        },
        {
          id: 'textoCabeceraACDA',
          title: 'Texto de cabecera'
        },
        {
          id: 'idClienteProveedorContrapartida',
          title: 'ID de cliente/proveedor de contrapartida'
        },
        {
          id: 'nombreClienteProveedorContrapartida',
          title: 'Nombre de cliente/proveedor de contrapartida'
        },
        {
          id: 'idSocioComercial',
          title: 'ID Socio comercial'
        },
        {
          id: 'nombreSocioComercial',
          title: 'Nombre Socio comercial'
        },
        {
          id: 'importeDebeMonedaEmpresa',
          title: 'Importe en debe en moneda de empresa'
        },
        {
          id: 'importeHaberMonedaEmpresa',
          title: 'Importe en haber en moneda de empresa'
        },
        {
          id: 'saldoMonedaEmpresa',
          title: 'Saldo en moneda de empresa'
        },
        {
          id: 'importeDebeMonedaTransaccion',
          title: 'Importe en debe en moneda de transacción'
        },
        {
          id: 'importeHaberMonedaTransaccion',
          title: 'Importe en haber en moneda de transacción'
        },
        {
          id: 'saldoMonedaTransaccion',
          title: 'Saldo en moneda de transacción'
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

      cursor.importeDebeMonedaEmpresa = customValidator.numberToStringDecimal(
        cursor.importeDebeMonedaEmpresa
      );

      cursor.importeHaberMonedaEmpresa = customValidator.numberToStringDecimal(
        cursor.importeHaberMonedaEmpresa
      );

      cursor.saldoMonedaEmpresa = customValidator.numberToStringDecimal(
        cursor.saldoMonedaEmpresa
      );

      cursor.importeDebeMonedaTransaccion = customValidator.numberToStringDecimal(
        cursor.importeDebeMonedaTransaccion
      );

      cursor.importeHaberMonedaTransaccion = customValidator.numberToStringDecimal(
        cursor.importeHaberMonedaTransaccion
      );

      cursor.saldoMonedaTransaccion = customValidator.numberToStringDecimal(
        cursor.saldoMonedaTransaccion
      );
    });

    let writerPromise = null;
    if (reportLength < 102) {
      writerPromise = Promise.resolve().then(() =>
        csvWriter.writeRecords(reportData)
      );
    } else {
      const n = 100;
      const result = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
      ]; //we create it, then we'll fill it
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
        .then(() => csvWriter.writeRecords(result[9]))
        .then(() => csvWriter.writeRecords(result[10]))
        .then(() => csvWriter.writeRecords(result[11]))
        .then(() => csvWriter.writeRecords(result[12]))
        .then(() => csvWriter.writeRecords(result[13]))
        .then(() => csvWriter.writeRecords(result[14]))
        .then(() => csvWriter.writeRecords(result[15]))
        .then(() => csvWriter.writeRecords(result[16]))
        .then(() => csvWriter.writeRecords(result[17]))
        .then(() => csvWriter.writeRecords(result[18]))
        .then(() => csvWriter.writeRecords(result[19]))
        .then(() => csvWriter.writeRecords(result[20]))
        .then(() => csvWriter.writeRecords(result[21]))
        .then(() => csvWriter.writeRecords(result[22]))
        .then(() => csvWriter.writeRecords(result[23]))
        .then(() => csvWriter.writeRecords(result[24]))
        .then(() => csvWriter.writeRecords(result[25]))
        .then(() => csvWriter.writeRecords(result[26]))
        .then(() => csvWriter.writeRecords(result[27]))
        .then(() => csvWriter.writeRecords(result[28]))
        .then(() => csvWriter.writeRecords(result[29]))
        .then(() => csvWriter.writeRecords(result[30]))
        .then(() => csvWriter.writeRecords(result[31]))
        .then(() => csvWriter.writeRecords(result[32]))
        .then(() => csvWriter.writeRecords(result[33]))
        .then(() => csvWriter.writeRecords(result[34]))
        .then(() => csvWriter.writeRecords(result[35]))
        .then(() => csvWriter.writeRecords(result[36]))
        .then(() => csvWriter.writeRecords(result[37]))
        .then(() => csvWriter.writeRecords(result[38]))
        .then(() => csvWriter.writeRecords(result[39]))
        .then(() => csvWriter.writeRecords(result[40]))
        .then(() => csvWriter.writeRecords(result[41]))
        .then(() => csvWriter.writeRecords(result[42]))
        .then(() => csvWriter.writeRecords(result[43]))
        .then(() => csvWriter.writeRecords(result[44]))
        .then(() => csvWriter.writeRecords(result[45]))
        .then(() => csvWriter.writeRecords(result[46]))
        .then(() => csvWriter.writeRecords(result[47]))
        .then(() => csvWriter.writeRecords(result[48]))
        .then(() => csvWriter.writeRecords(result[49]))
        .then(() => csvWriter.writeRecords(result[50]))
        .then(() => csvWriter.writeRecords(result[51]))
        .then(() => csvWriter.writeRecords(result[52]))
        .then(() => csvWriter.writeRecords(result[53]))
        .then(() => csvWriter.writeRecords(result[54]))
        .then(() => csvWriter.writeRecords(result[55]))
        .then(() => csvWriter.writeRecords(result[56]))
        .then(() => csvWriter.writeRecords(result[57]))
        .then(() => csvWriter.writeRecords(result[58]))
        .then(() => csvWriter.writeRecords(result[59]))
        .then(() => csvWriter.writeRecords(result[60]))
        .then(() => csvWriter.writeRecords(result[61]))
        .then(() => csvWriter.writeRecords(result[62]))
        .then(() => csvWriter.writeRecords(result[63]))
        .then(() => csvWriter.writeRecords(result[64]))
        .then(() => csvWriter.writeRecords(result[65]))
        .then(() => csvWriter.writeRecords(result[66]))
        .then(() => csvWriter.writeRecords(result[67]))
        .then(() => csvWriter.writeRecords(result[68]))
        .then(() => csvWriter.writeRecords(result[69]))
        .then(() => csvWriter.writeRecords(result[70]))
        .then(() => csvWriter.writeRecords(result[71]))
        .then(() => csvWriter.writeRecords(result[72]))
        .then(() => csvWriter.writeRecords(result[73]))
        .then(() => csvWriter.writeRecords(result[74]))
        .then(() => csvWriter.writeRecords(result[75]))
        .then(() => csvWriter.writeRecords(result[76]))
        .then(() => csvWriter.writeRecords(result[77]))
        .then(() => csvWriter.writeRecords(result[78]))
        .then(() => csvWriter.writeRecords(result[79]))
        .then(() => csvWriter.writeRecords(result[80]))
        .then(() => csvWriter.writeRecords(result[81]))
        .then(() => csvWriter.writeRecords(result[82]))
        .then(() => csvWriter.writeRecords(result[83]))
        .then(() => csvWriter.writeRecords(result[84]))
        .then(() => csvWriter.writeRecords(result[85]))
        .then(() => csvWriter.writeRecords(result[86]))
        .then(() => csvWriter.writeRecords(result[87]))
        .then(() => csvWriter.writeRecords(result[88]))
        .then(() => csvWriter.writeRecords(result[89]))
        .then(() => csvWriter.writeRecords(result[90]))
        .then(() => csvWriter.writeRecords(result[91]))
        .then(() => csvWriter.writeRecords(result[92]))
        .then(() => csvWriter.writeRecords(result[93]))
        .then(() => csvWriter.writeRecords(result[94]))
        .then(() => csvWriter.writeRecords(result[95]))
        .then(() => csvWriter.writeRecords(result[96]))
        .then(() => csvWriter.writeRecords(result[97]))
        .then(() => csvWriter.writeRecords(result[98]))
        .then(() => csvWriter.writeRecords(result[99]));
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
