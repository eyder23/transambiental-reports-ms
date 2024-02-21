// Created By Eyder Ascuntar Rosales
const mongoose = require('mongoose');

const programacionActivosFijosSchema = new mongoose.Schema({
  claseActivoFijo: {
    type: String,
    trim: true
  },
  idActivoFijo: {
    type: String,
    trim: true
  },
  textoActivoFijo: {
    type: String,
    trim: true
  },
  periodoAnioContable: {
    type: String,
    trim: true
  },
  fechaCapitalizacion: {
    type: Date
  },
  monedaEmpresa: {
    type: String,
    trim: true
  },
  fecha: {
    type: Date
  },
  fechaInicioDepreciacion: {
    type: Date
  },
  tasaAmortizacionEfectiva: {
    type: String,
    trim: true
  },
  ejercicioFiscal: {
    type: String,
    trim: true
  },
  ejercicioFiscalAdquisicion: {
    type: String,
    trim: true
  },
  estadoCicloVidaActivoFijo: {
    type: String,
    trim: true
  },
  fechaFinParalizacionTemporalActivoFijo: {
    type: Date
  },
  fechaInicioParalizacionTemporalActivoFijo: {
    type: Date
  },
  costeAdquisicionInicial: {
    type: String,
    trim: true
  },
  costeAdquisicionAlInicio: {
    type: String,
    trim: true
  },
  costeAdquisicionAlFinal: {
    type: String,
    trim: true
  },
  amortizacionAcumuladaAlInicio: {
    type: String,
    trim: true
  },
  depreciacionAcumuladaAlFinal: {
    type: String,
    trim: true
  },
  depreciacion: {
    type: String,
    trim: true
  },
  //   Columna O
  costesAdquisicion: {
    type: String,
    trim: true
  },
  valorNetoContableAlInicio: {
    type: String,
    trim: true
  },
  valorNetoContableAlFinal: {
    type: String,
    trim: true
  },
  capitalizacionRetroactiva: {
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
  ajusteValorCapitalizacionRetroactiva: {
    type: String,
    trim: true
  },
  ajusteValorParaBajas: {
    type: String,
    trim: true
  },
  ajusteValorParaTransferencias: {
    type: String,
    trim: true
  },
  amortizacion: {
    type: String,
    trim: true
  },
  revalorizaciones: {
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
programacionActivosFijosSchema.index({ claseActivoFijo: +1 });
programacionActivosFijosSchema.index({ idActivoFijo: +1 });
programacionActivosFijosSchema.index({ textoActivoFijo: +1 });
programacionActivosFijosSchema.index({ fechaInicioDepreciacion: +1 });
programacionActivosFijosSchema.index({
  estadoCicloVidaActivoFijo: +1
});

const ProgramacionActivosFijos = mongoose.model(
  'ProgramacionActivosFijos',
  programacionActivosFijosSchema,
  'ProgramacionActivosFijos'
);
ProgramacionActivosFijos.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = ProgramacionActivosFijos;
