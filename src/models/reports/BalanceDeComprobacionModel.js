// Created By Eyder Ascuntar Rosales
const mongoose = require('mongoose');

const balanceDeComprobacionSchema = new mongoose.Schema({
  partidaBalanceCuentaResultados: {
    type: String,
    trim: true
  },
  importeMonedaEmpresa: {
    type: String,
    trim: true
  },
  periodo: {
    type: String,
    immutable: true
  },
  anio: {
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
balanceDeComprobacionSchema.index({ partidaBalanceCuentaResultados: +1 });
balanceDeComprobacionSchema.index({ periodo: +1 });
balanceDeComprobacionSchema.index({ anio: +1 });
const BalanceDeComprobacion = mongoose.model(
  'BalanceDeComprobacion',
  balanceDeComprobacionSchema,
  'BalanceDeComprobacion'
);
BalanceDeComprobacion.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = BalanceDeComprobacion;
