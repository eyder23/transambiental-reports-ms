// Created By Eyder Ascuntar Rosales
const mongoose = require('mongoose');

const cuentasDeMayorPorTecerosSchema = new mongoose.Schema({
  idCuentaDeMayor: {
    type: String,
    trim: true
  },
  nombreCuentaDeMayor: {
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
  asientoContable: {
    type: String,
    trim: true
  },
  asientoContableDeAnulacion: {
    type: String,
    trim: true
  },

  idCentroCostos: {
    type: String,
    trim: true
  },
  nombreCentroCostos: {
    type: String,
    trim: true
  },
  fechaContabilizacion: {
    type: Date
  },
  idDocumentoOriginal: {
    type: String,
    trim: true
  },
  periodoContable: {
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
cuentasDeMayorPorTecerosSchema.index({ idCuentaDeMayor: +1 });
cuentasDeMayorPorTecerosSchema.index({ idClienteProveedorContrapartida: +1 });
cuentasDeMayorPorTecerosSchema.index({ asientoContable: +1 });
cuentasDeMayorPorTecerosSchema.index({ fechaContabilizacion: +1 });
const CuentasDeMayorPorTerceros = mongoose.model(
  'CuentasDeMayorPorTerceros',
  cuentasDeMayorPorTecerosSchema,
  'CuentasDeMayorPorTerceros'
);
CuentasDeMayorPorTerceros.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = CuentasDeMayorPorTerceros;
