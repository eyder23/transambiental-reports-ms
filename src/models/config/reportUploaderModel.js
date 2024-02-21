// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const reportUploaderSchema = new mongoose.Schema({
  name: {
    type: String,
    uppercase: true,
    required: [
      true,
      'Por favor ingrese el nombre del reporte, es un dato obligatorio. '
    ]
  },
  code: {
    type: String,
    uppercase: true,
    required: [
      true,
      'Por favor ingrese el código del reporte, es un dato obligatorio. '
    ]
  },
  counterRows: {
    type: Number,
    uppercase: true
  },
  state: {
    type: String,
    uppercase: true
  },
  percentageCompletition: {
    type: Number,
    uppercase: true
  },
  message: {
    type: String,
    uppercase: true
  },
  startDate: {
    type: String,
    uppercase: true
  },
  endDate: {
    type: String,
    uppercase: true
  }
});

reportUploaderSchema.index({ companyId: +1, code: +1 });

const ReportUploader = mongoose.model('ReportUploader', reportUploaderSchema);
ReportUploader.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = ReportUploader;
