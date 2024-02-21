// Created By Eyder Ascuntar Rosales
const mongoose = require('mongoose');

const antiguedadCuentasPorCobrarSchema = new mongoose.Schema({
  idCliente: {
    type: String,
    trim: true
  },
  nombreCliente: {
    type: String,
    trim: true
  },
  asientoContable: {
    type: String,
    trim: true
  },
  fechaContabilizacion: {
    type: Date
  },
  fechaDocumento: {
    type: Date
  },
  idDocumento: {
    type: String,
    trim: true
  },
  tipoDocumento: {
    type: String,
    trim: true
  },
  importeAtrasado: {
    type: String,
    trim: true
  },

  _1_30_dias: {
    type: String,
    trim: true
  },
  _31_60_dias: {
    type: String,
    trim: true
  },

  _61_90_dias: {
    type: String,
    trim: true
  },
  _91_120_dias: {
    type: String,
    trim: true
  },
  _mas_120_dias: {
    type: String,
    trim: true
  },
  importePendiente: {
    type: String,
    trim: true
  },
  importeNoVencido: {
    type: String,
    trim: true
  },
  mesPeriodo: {
    type: String,
    trim: true
  },
  anioPeriodo: {
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
antiguedadCuentasPorCobrarSchema.index({ idCliente: +1 });
antiguedadCuentasPorCobrarSchema.index({ idDocumento: +1 });
antiguedadCuentasPorCobrarSchema.index({ fechaContabilizacion: +1 });
antiguedadCuentasPorCobrarSchema.index({ mesPeriodo: +1 });
antiguedadCuentasPorCobrarSchema.index({ anioPeriodo: +1 });
const AntiguedadCuentasPorCobrar = mongoose.model(
  'AntiguedadCuentasPorCobrar',
  antiguedadCuentasPorCobrarSchema,
  'AntiguedadCuentasPorCobrar'
);
AntiguedadCuentasPorCobrar.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = AntiguedadCuentasPorCobrar;
