// Created By Eyder Ascuntar Rosales
const mongoose = require('mongoose');

const cuentasDeMayorPartidasIndividualesSchema = new mongoose.Schema({
  idCuentaDeMayor: {
    type: String,
    trim: true
  },
  nombreCuentaDeMayor: {
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
  textoCabecera: {
    type: String,
    trim: true
  },
  posicionAsientoContable: {
    type: String,
    trim: true
  },
  textoPosicion: {
    type: String,
    trim: true
  },

  tipoAsientoContable: {
    type: String,
    trim: true
  },
  idDocumentoOriginal: {
    type: String,
    trim: true
  },
  ejercicioFiscal: {
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
  idCentroBeneficio: {
    type: String,
    trim: true
  },
  nombreCentroBeneficio: {
    type: String,
    trim: true
  },
  idActivoFijo: {
    type: String,
    trim: true
  },

  //

  nombreActivoFijo: {
    type: String,
    trim: true
  },

  idActivo: {
    type: String,
    trim: true
  },
  nombreActivo: {
    type: String,
    trim: true
  },
  idClaseActivoFijo: {
    type: String,
    trim: true
  },
  nombreClaseActivoFijo: {
    type: String,
    trim: true
  },
  asientoContableAnulado: {
    type: String,
    trim: true
  },
  // Texto de cabecera de la anterior columna
  textoCabeceraACA: {
    type: String,
    trim: true
  },
  asientoContableDeAnulacion: {
    type: String,
    trim: true
  },
  // Texto de cabecera de la anterior columna
  textoCabeceraACDA: {
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
  idSocioComercial: {
    type: String,
    trim: true
  },
  nombreSocioComercial: {
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
  importeDebeMonedaTransaccion: {
    type: String,
    trim: true
  },
  importeHaberMonedaTransaccion: {
    type: String,
    trim: true
  },
  saldoMonedaTransaccion: {
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
cuentasDeMayorPartidasIndividualesSchema.index({ idCuentaDeMayor: +1 });
cuentasDeMayorPartidasIndividualesSchema.index({ fechaContabilizacion: +1 });
cuentasDeMayorPartidasIndividualesSchema.index({ asientoContable: +1 });
cuentasDeMayorPartidasIndividualesSchema.index({
  nombreClienteProveedorContrapartida: +1
});
cuentasDeMayorPartidasIndividualesSchema.index({ nombreSocioComercial: +1 });
cuentasDeMayorPartidasIndividualesSchema.index({ ejercicioFiscal: +1 });

const CuentasDeMayorPartidasIndividuales = mongoose.model(
  'CuentasDeMayorPartidasIndividuales',
  cuentasDeMayorPartidasIndividualesSchema,
  'CuentasDeMayorPartidasIndividuales'
);
CuentasDeMayorPartidasIndividuales.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = CuentasDeMayorPartidasIndividuales;
