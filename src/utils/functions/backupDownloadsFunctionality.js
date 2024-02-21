/* eslint-disable no-inner-declarations */
// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const Excel = require('exceljs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');
const ApiError = require('../../dto/commons/response/apiErrorDTO');
const ServiceException = require('../errors/serviceException');
const commonErrors = require('../constants/commonErrors');
const reportGeneratorMessages = require('../constants/reportGeneratorMessages');
const CuentasDeMayorPartidasIndividuales = require('../../models/reports/CuentasDeMayorPartidasIndividualesModel');
const httpCodes = require('../constants/httpCodes');
const constants = require('../constants/constants');
const SummaryLoadedData = require('../../dto/summaryLoadedDataDTO');
const CommonLst = require('../../dto/commons/commonLstDTO');
const APIFeatures = require('../responses/apiFeatures');
const ReportUploader = require('../../models/config/reportUploaderModel');
const reportFunctionsUpdate = require('./reportFunctionsUpdate');
const customValidator = require('../validators/validator');
const email = require('../email/senders/email');
const admz = require('adm-zip');
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
  const features = new APIFeatures(
    CuentasDeMayorPartidasIndividuales.find()
      .sort({ fechaContabilizacion: 1 })
      .lean(),
    req.query
  )
    .filterTable(
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
    )
    .sort()
    .limitFields()
    .paginate();

  const featuresCounter = new APIFeatures(
    CuentasDeMayorPartidasIndividuales.countDocuments(),
    req.query
  ).filterTable(
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
  // this.sendReportCSV(rows);
  // return 'proceso correcto';
};

exports.getAllAdvancedFilter = async req => {
  //MONTH-DAY-YEAR
  const features = new APIFeatures(
    CuentasDeMayorPartidasIndividuales.find()
      .sort({ fechaContabilizacion: 1 })
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
    .findByExact('nombreSocioComercial', req.body.nombreSocioComercial);

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

exports.sendReportCSV = async reportData => {
  try {
    console.log(
      '>>>>>>>>>>>>  empecé proceso para envío de reporte',
      new Date()
    );
    const nameFile = 'CUENTAS DE MAYOR PARTIDAS INDIVIDUALES';
    const pathTmp = path.resolve(__dirname, '../../resources/uploads/');
    // const pathx = `${pathTmp}//${nameFile}.csv`;
    const pathx = `${pathTmp}/${nameFile}.csv`;

    const csvWriter = createCsvWriter({
      path: pathx,
      fieldDelimiter: ';',
      header: [
        { id: 'idCuentaDeMayor', title: 'ID Cuenta de mayor' },
        { id: 'nombreCuentaDeMayor', title: 'Nombre Cuenta de mayor' },
        { id: 'fechaContabilizacion', title: 'Fecha de contabilización' },
        { id: 'asientoContable', title: 'Asiento contable' }
      ]
    });

    reportData.forEach(function(cursor, index, object) {
      cursor.fechaContabilizacion = customValidator.stringFromDate(
        cursor.fechaContabilizacion
      );
    });
    console.log('>>>>>>>>>>>>  empecé a escribir en archivo', new Date());

    let userInfo = {};
    userInfo.name = 'Eyder';
    userInfo.lastname = 'Ascuntar';
    userInfo.email = 'eaar23@gmail.com';

    csvWriter.writeRecords(reportData).then(function() {
      console.log('Terminé de escribir el archivo', new Date());
      // async function finishReport() {
      //   // Actualizando información encabezado reporte
      //   objectReportResume.state = 'email_send';
      //   objectReportResume.percentageCompletition = 100;
      //   objectReportResume.message =
      //     'Reporte enviado a correo electrónico del usuario';
      //   objectReportResume.endDate = new Date();
      //   await reportFunctionsUpdate.updateReportCreator(objectReportResume);
      // }
      // finishReport();

      let message = '';
      try {
        message = fs.readFileSync(
          path.resolve(
            __dirname,
            '../../utils/email/templates/reportGenerator.html'
          ),
          'utf8'
        );
        message = message.replace(
          '$#$#$#USER#$#$#$',
          `${userInfo.name} ${userInfo.lastname}`
        );
        message = message.replace('$#$#$#REPORT_NAME#$#$#$', `${nameFile}`);
      } catch (err) {
        console.error(err);
      }
      email.sendEmailWithAttachments({
        email: userInfo.email,
        subject: 'Generación de Reportes',
        message: message,
        path: pathx
      });
    });
  } catch (err) {
    throw err;
  }
};

exports.downloadGlobalReport = async (req, res) => {
  console.log(
    '>>>>>>>>>>>>  Empezando proceso carga de data en memoria',
    new Date()
  );
  const reportData = await CuentasDeMayorPartidasIndividuales.find()
    .sort({
      fechaContabilizacion: 1
    })
    .limit(5)
    .lean();
  let zp = new admz();

  console.log(
    '>>>>>>>>>>>>  Finalizando proceso carga de data en memoria',
    new Date()
  );
  const nameFile = 'CUENTAS DE MAYOR PARTIDAS INDIVIDUALES';
  const pathTmp = path.resolve(__dirname, '../../resources/uploads/');
  // const pathx = `${pathTmp}//${nameFile}.csv`;
  const pathx = `${pathTmp}/${nameFile}.csv`;

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
      }
    ]
  });

  reportData.forEach(function(cursor, index, object) {
    cursor.fechaContabilizacion = customValidator.stringFromDate(
      cursor.fechaContabilizacion
    );
  });

  let userInfo = {};
  userInfo.name = 'Coordinador';
  userInfo.lastname = 'Sistemas';
  // userInfo.email = 'coordinador.sistemas@transambiental.com.co';
  userInfo.email = 'eyder.ascuntar@runcode.co';

  await csvWriter.writeRecords(reportData).then(function() {
    console.log('Terminé de escribir el archivo', new Date());

    zp.addLocalFile(pathx);
    const pathDownloadTmp = '/home/eyder/Downloads/testDownload';
    const genCode = Math.floor(100000 + Math.random() * 900000);
    const fileDef = `${pathDownloadTmp}/${nameFile + '-' + genCode}.zip`;
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
      message = message.replace(
        '$#$#$#USER#$#$#$',
        `${userInfo.name} ${userInfo.lastname}`
      );
      message = message.replace('$#$#$#REPORT_NAME#$#$#$', `${nameFile}`);
    } catch (err) {
      console.error(err);
    }
    email.sendEmailWithAttachments({
      email: userInfo.email,
      subject: 'Generación de Reportes',
      message: message,
      path: fileDef
    });
  });

  // toBuffer() is used to read the data and save it
  // for downloading process!
  // const data = zp.toBuffer();

  // this is the code for downloading!
  // here we have to specify 3 things:
  // 1. type of content that we are downloading
  // 2. name of file to be downloaded
  // 3. length or size of the downloaded file!
  // return data;
  return true;

  // res.set('Content-Type', 'application/octet-stream');
  // res.set('Content-Disposition', `attachment; filename=${file_after_download}`);
  // res.set('Content-Length', data.length);
  // res.send(data);
};
