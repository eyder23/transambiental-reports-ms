// Created By Eyder Ascuntar Rosales
const mongoose = require('mongoose');

const seguimientoPedidosDeCompraSchema = new mongoose.Schema({
  estadoPedidoCompra: {
    type: String,
    trim: true
  },
  idPedidoCompra: {
    type: String,
    trim: true
  },
  posicionPedidoCompra: {
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
  producto: {
    type: String,
    trim: true
  },
  fechaCreacionPedido: {
    type: Date
  },
  fechaPedido: {
    type: Date
  },
  precioNeto: {
    type: String,
    trim: true
  },
  cantidadPedida: {
    type: String,
    trim: true
  },
  cantidadEntregada: {
    type: String,
    trim: true
  },
  cantidadFacturada: {
    type: String,
    trim: true
  },
  valorEntregado: {
    type: String,
    trim: true
  },
  valorEntregadoEnMonedaEmpresa: {
    type: String,
    trim: true
  },
  valorFacturado: {
    type: String,
    trim: true
  },
  valorFacturadoEnMonedaEmpresa: {
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
seguimientoPedidosDeCompraSchema.index({ idPedidoCompra: +1 });
seguimientoPedidosDeCompraSchema.index({ proveedor: +1 });
seguimientoPedidosDeCompraSchema.index({ nombreProveedor: +1 });
seguimientoPedidosDeCompraSchema.index({ fechaCreacionPedido: +1 });
const SeguimientoPedidosDeCompra = mongoose.model(
  'SeguimientoPedidosDeCompra',
  seguimientoPedidosDeCompraSchema,
  'SeguimientoPedidosDeCompra'
);
SeguimientoPedidosDeCompra.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = SeguimientoPedidosDeCompra;
