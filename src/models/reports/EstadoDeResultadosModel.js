// Created By Eyder Ascuntar Rosales
const mongoose = require('mongoose');

const estadoDeResultadosSchema = new mongoose.Schema({
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
estadoDeResultadosSchema.index({ partidaBalanceCuentaResultados: +1 });
estadoDeResultadosSchema.index({ periodo: +1 });
estadoDeResultadosSchema.index({ anio: +1 });
const EstadoDeResultados = mongoose.model(
  'EstadoDeResultados',
  estadoDeResultadosSchema,
  'EstadoDeResultados'
);
EstadoDeResultados.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = EstadoDeResultados;
