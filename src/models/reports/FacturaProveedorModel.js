// Created By Eyder Ascuntar Rosales
const mongoose = require('mongoose');

const facturaProveedorSchema = new mongoose.Schema({
  idDocumento: {
    type: String,
    trim: true
  },
  estadoFactura: {
    type: String,
    trim: true
  },
  tipoDocumento: {
    type: String,
    trim: true
  },
  fechaFactura: {
    type: Date,
    trim: true
  },
  reembolso: {
    type: String,
    trim: true
  },
  idDocumentoExterno: {
    type: String,
    trim: true
  },
  fechaContabilizacion: {
    type: Date,
    trim: true
  },
  idPedidoCompra: {
    type: String,
    trim: true
  },
  estado: {
    type: String,
    trim: true
  },
  proveedor: {
    type: String,
    trim: true
  },
  nombreProveedor: {
    type: String,
    trim: true
  },
  importeFactura: {
    type: String,
    trim: true
  },
  importeNeto: {
    type: String,
    trim: true
  },
  importeImpuesto: {
    type: String,
    trim: true
  },
  importeBruto: {
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
facturaProveedorSchema.index({ idDocumento: +1 });
facturaProveedorSchema.index({ idDocumentoExterno: +1 });
facturaProveedorSchema.index({ nombreProveedor: +1 });
facturaProveedorSchema.index({ proveedor: +1 });
facturaProveedorSchema.index({ fechaFactura: +1 });
facturaProveedorSchema.index({ fechaContabilizacion: +1 });
const FacturaProveedor = mongoose.model(
  'FacturaProveedor',
  facturaProveedorSchema,
  'FacturaProveedor'
);
FacturaProveedor.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = FacturaProveedor;
