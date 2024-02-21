// Created By Eyder Ascuntar Rosales
const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  cliente: {
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
clienteSchema.index({ cliente: +1 });
clienteSchema.index({ nombre: +1 });
clienteSchema.index({ numeroIdentificacionFiscal: +1 });
const Cliente = mongoose.model('Cliente', clienteSchema, 'Cliente');
Cliente.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = Cliente;
