// Created By Eyder Ascuntar Rosales
const mongoose = require('mongoose');

const seguimientoEntradaDeMercanciasSchema = new mongoose.Schema({
  estadoEntradaMercanciasServicios: {
    type: String,
    trim: true
  },
  idProveedor: {
    type: String,
    trim: true
  },
  nombreProveedor: {
    type: String,
    trim: true
  },
  idProducto: {
    type: String,
    trim: true
  },
  nombreProducto: {
    type: String,
    trim: true
  },
  idEntradaMercanciasServicios: {
    type: String,
    trim: true
  },
  idPosicionEntradaMercanciasServicios: {
    type: String,
    trim: true
  },
  idPedidoCompra: {
    type: String,
    trim: true
  },
  cantidad: {
    type: String,
    trim: true
  },
  valorNeto: {
    type: String,
    trim: true
  },
  valorNetoMonedaEmpresa: {
    type: String,
    trim: true
  },
  precio: {
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
seguimientoEntradaDeMercanciasSchema.index({ idProveedor: +1 });
seguimientoEntradaDeMercanciasSchema.index({ nombreProveedor: +1 });
seguimientoEntradaDeMercanciasSchema.index({
  idEntradaMercanciasServicios: +1
});
seguimientoEntradaDeMercanciasSchema.index({ idPedidoCompra: +1 });
const SeguimientoEntradaDeMercancias = mongoose.model(
  'SeguimientoEntradaDeMercancias',
  seguimientoEntradaDeMercanciasSchema,
  'SeguimientoEntradaDeMercancias'
);
SeguimientoEntradaDeMercancias.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = SeguimientoEntradaDeMercancias;
