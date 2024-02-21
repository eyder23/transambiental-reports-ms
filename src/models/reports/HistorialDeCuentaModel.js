// Created By Eyder Ascuntar Rosales
const mongoose = require('mongoose');

const historialDeCuentaSchema = new mongoose.Schema({
  idCuentaDeMayor: {
    type: String,
    trim: true
  },
  nombreCuentaDeMayor: {
    type: String,
    trim: true
  },
  periodoAnioContable: {
    type: String,
    trim: true
  },
  fechaContabilizacion: {
    type: Date
  },
  asientoContable: {
    type: String,
    trim: true
  },
  idDocumentoOriginal: {
    type: String,
    trim: true
  },
  asientoContableDeAnulacion: {
    type: String,
    trim: true
  },
  idDocumentoOriginalExtra: {
    type: String,
    trim: true
  },
  idCuentaContraPartidaLibroMayor: {
    type: String,
    trim: true
  },
  nombreCuentaContraPartidaLibroMayor: {
    type: String,
    trim: true
  },
  idClienteProveedorContrapartida: {
    type: String,
    trim: true
  },
  nombreClienteProveedorContrapartida: {
    type: String,
    trim: true
  },
  idDocumentoOriginalDeReferencia: {
    type: String,
    trim: true
  },
  //   Columna O
  idDocumentoOriginalExtra2: {
    type: String,
    trim: true
  },
  idDocumentoOperativo: {
    type: String,
    trim: true
  },
  referenciaExternaDocumentoOriginal: {
    type: String,
    trim: true
  },
  idSocioComercial: {
    type: String,
    trim: true
  },
  nombreSocioComercial: {
    type: String,
    trim: true
  },
  textoCabeceraAsientoContable: {
    type: String,
    trim: true
  },
  textoPosicionAsientoContable: {
    type: String,
    trim: true
  },
  saldoInicialMonedaEmpresa: {
    type: String,
    trim: true
  },
  importeDebeMonedaEmpresa: {
    type: String,
    trim: true
  },
  importeHaberMonedaEmpresa: {
    type: String,
    trim: true
  },
  saldoMonedaEmpresa: {
    type: String,
    trim: true
  },
  // ====================================
  createAt: {
    type: Date,
    default: new Date()
  },
  updateAt: {
    type: Date
  }
});
// Indexes definition
historialDeCuentaSchema.index({ idCuentaDeMayor: +1 });
historialDeCuentaSchema.index({ periodoAnioContable: +1 });
historialDeCuentaSchema.index({ fechaContabilizacion: +1 });
historialDeCuentaSchema.index({ idClienteProveedorContrapartida: +1 });
historialDeCuentaSchema.index({ nombreClienteProveedorContrapartida: +1 });
historialDeCuentaSchema.index({ idSocioComercial: +1 });
historialDeCuentaSchema.index({ nombreSocioComercial: +1 });

const HistorialDeCuenta = mongoose.model(
  'HistorialDeCuenta',
  historialDeCuentaSchema,
  'HistorialDeCuenta'
);
HistorialDeCuenta.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = HistorialDeCuenta;
