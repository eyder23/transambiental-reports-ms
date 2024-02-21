// Created By Eyder Ascuntar Rosales
const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema({
  proveedor: {
    type: String,
    trim: true
  },
  nombre: {
    type: String,
    trim: true
  },
  tipoNumeroIdentificacionFiscal: {
    type: String,
    trim: true
  },
  numeroIdentificacionFiscal: {
    type: String,
    trim: true
  },
  ciudad: {
    type: String,
    trim: true
  },
  estFedProv: {
    type: String,
    trim: true
  },
  direccion: {
    type: String,
    trim: true
  },
  paisRegion: {
    type: String,
    trim: true
  },
  createAt: {
    type: Date,
    default: new Date()
  },
  updateAt: {
    type: Date
  }
});
// Indexes definition
proveedorSchema.index({ proveedorSchema: +1 });
proveedorSchema.index({ nombre: +1 });
proveedorSchema.index({ numeroIdentificacionFiscal: +1 });
const Proveedor = mongoose.model('Proveedor', proveedorSchema, 'Proveedor');
Proveedor.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = Proveedor;
