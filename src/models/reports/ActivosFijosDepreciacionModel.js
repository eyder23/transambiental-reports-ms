// Created By Eyder Ascuntar Rosales
const mongoose = require('mongoose');

const activosFijosDepreciacionSchema = new mongoose.Schema({
  idClaseActivoFijo: {
    type: String,
    trim: true
  },
  nombreClaseActivoFijo: {
    type: String,
    trim: true
  },
  idActivoFijo: {
    type: String,
    trim: true
  },
  nombreActivoFijo: {
    type: String,
    trim: true
  },
  idCentroDeConste: {
    type: String,
    trim: true
  },
  nombreCentroDeConste: {
    type: String,
    trim: true
  },
  vidaUtilAnios: {
    type: String,
    trim: true
  },
  vidaUtilPeriodos: {
    type: String,
    trim: true
  },
  depreciacionPlanificada: {
    type: String,
    trim: true
  },
  depreciacionEspecialPlanificada: {
    type: String,
    trim: true
  },
  periodo: {
    type: String,
    immutable: true
  },
  valorNetoContable: {
    type: String,
    trim: true
  },
  costesAdquisicion: {
    type: String,
    trim: true
  },
  bajas: {
    type: String,
    trim: true
  },
  transferencias: {
    type: String,
    trim: true
  },
  revaloraciones: {
    type: String,
    trim: true
  },
  depreciacionAcumulada: {
    type: String,
    trim: true
  },
  totalDepreciacion: {
    type: String,
    trim: true
  },
  depreciacionContabilizada: {
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
activosFijosDepreciacionSchema.index({ nombreClaseActivoFijo: +1 });
activosFijosDepreciacionSchema.index({ nombreActivoFijo: +1 });
activosFijosDepreciacionSchema.index({ periodo: +1 });
const ActivosFijosDepreciacion = mongoose.model(
  'ActivosFijosDepreciacion',
  activosFijosDepreciacionSchema,
  'ActivosFijosDepreciacion'
);
ActivosFijosDepreciacion.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = ActivosFijosDepreciacion;
