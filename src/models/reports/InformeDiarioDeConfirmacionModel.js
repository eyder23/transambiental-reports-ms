// Created By Eyder Ascuntar Rosales
const mongoose = require('mongoose');

const informeDiarioDeConfirmacionSchema = new mongoose.Schema({
  sede: {
    type: String,
    trim: true
  },
  producto: {
    type: String,
    trim: true
  },
  identificador: {
    type: String,
    trim: true
  },
  idStockIdentificado: {
    type: String,
    trim: true
  },
  idAreaLogistica: {
    type: String,
    trim: true
  },
  creadoEl: {
    type: Date
  },
  tipoDocumentoConfirmacion: {
    type: String,
    trim: true
  },
  idConfirmacion: {
    type: String,
    trim: true
  },
  cantidadEfectiva: {
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
informeDiarioDeConfirmacionSchema.index({ sede: +1 });
informeDiarioDeConfirmacionSchema.index({ producto: +1 });
informeDiarioDeConfirmacionSchema.index({ idAreaLogistica: +1 });
informeDiarioDeConfirmacionSchema.index({ creadoEl: +1 });
informeDiarioDeConfirmacionSchema.index({ idConfirmacion: +1 });
informeDiarioDeConfirmacionSchema.index({ identificador: +1 });
const InformeDiarioDeConfirmacion = mongoose.model(
  'InformeDiarioDeConfirmacion',
  informeDiarioDeConfirmacionSchema,
  'InformeDiarioDeConfirmacion'
);
InformeDiarioDeConfirmacion.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = InformeDiarioDeConfirmacion;
