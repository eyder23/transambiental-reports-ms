// Created By Eyder Ascuntar Rosales
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
const clienteRoute = require('./src/routes/reports/clienteRoute');
const proveedorRoute = require('./src/routes/reports/proveedorRoute');
const facturaProveedorRoute = require('./src/routes/reports/facturaProveedorRoute');
const cuentasMayorPartidasIndividualesRoute = require('./src/routes/reports/cuentasMayorPartidasIndividualesRoute');
const cuentasMayorPorTercerosRoute = require('./src/routes/reports/cuentasMayorPorTercerosRoute');
const historialDeCuentaRoute = require('./src/routes/reports/historialDeCuentaRoute');
const programacionActivosFijosRoute = require('./src/routes/reports/programacionActivosFijosRoute');
const antiguedadCuentasPorCobrarRoute = require('./src/routes/reports/antiguedadCuentasPorCobrarRoute');
const informeDiarioDeConfirmacionRoute = require('./src/routes/reports/informeDiarioDeConfirmacionRoute');
const seguimientoPedidosDeCompraRoute = require('./src/routes/reports/seguimientoPedidosDeCompraRoute');
const seguimientoEntradaDeMercanciasRoute = require('./src/routes/reports/seguimientoEntradaDeMercanciasRoute');
const balanceDeComprobacionRoute = require('./src/routes/reports/balanceDeComprobacionRoute');
const activosFijosDepreciacionRoute = require('./src/routes/reports/activosFijosDepreciacionRoute');
const estadoDeResultadosRoute = require('./src/routes/reports/estadoDeResultadosRoute');
const reportEnableRoute = require('./src/routes/config/reportEnableRoute');
const reportUploaderRoute = require('./src/routes/config/reportUploaderRoute');
const reportDownloaderRoute = require('./src/routes/config/reportDownloaderRoute');
const notFoundRoute = require('./src/routes/common/notFoundRoute');

const app = express();

app.use(cors());
// Permit All
app.options('*', cors());
// Select Permit
// app.use(
//   cors({
//     origin: 'http://localhost:4200'
//   })
// );

// ================= Set security HTTP headers
app.use(helmet());

// ================= Morgan, middleware to get url of request, only on dev enviroment Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ================= Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // One Hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
// app.use("/api", limiter);

// ================= Body parser, reading data from body into req.body
app.use(express.json());

// ================= To compress text response to clients
app.use(compression());

// ================= Ignore call favicon
app.use((req, res, next) => {
  if (req.url === '/favicon.ico') {
    res.status(204).json({ nope: true });
  } else {
    next();
  }
});

// ================= Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// ================= Data sanitization against XSS
app.use(xss());

// ================= ROUTES DEFINITION
app.use('/api/v1/clientes', clienteRoute);
app.use('/api/v1/proveedores', proveedorRoute);
app.use('/api/v1/facturas-proveedor', facturaProveedorRoute);
app.use(
  '/api/v1/cuentas-mayor-partidas-individuales',
  cuentasMayorPartidasIndividualesRoute
);
app.use('/api/v1/cuentas-mayor-por-terceros', cuentasMayorPorTercerosRoute);
app.use('/api/v1/historial-de-cuenta', historialDeCuentaRoute);
app.use('/api/v1/programacion-activos-fijos', programacionActivosFijosRoute);
app.use(
  '/api/v1/antiguedad-cuentas-por-cobrar',
  antiguedadCuentasPorCobrarRoute
);
app.use(
  '/api/v1/informe-diario-de-confirmacion',
  informeDiarioDeConfirmacionRoute
);
app.use(
  '/api/v1/seguimiento-pedidos-de-compra',
  seguimientoPedidosDeCompraRoute
);
app.use(
  '/api/v1/seguimiento-entrada-de-mercancias',
  seguimientoEntradaDeMercanciasRoute
);
app.use('/api/v1/activos-fijos-depreciacion', activosFijosDepreciacionRoute);
app.use('/api/v1/balance-de-comprobacion', balanceDeComprobacionRoute);
app.use('/api/v1/estado-de-resultados', estadoDeResultadosRoute);

app.use('/api/v1/reportEnable', reportEnableRoute);
app.use('/api/v1/reportUploader', reportUploaderRoute);
app.use('/api/v1/reportDownloader', reportDownloaderRoute);
app.all('*', notFoundRoute);

module.exports = app;
