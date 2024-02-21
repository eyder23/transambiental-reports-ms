const ReportUploader = require('../../models/config/reportUploaderModel');
const ReportDownloader = require('../../models/config/reportDownloaderModel');

exports.updateReportUploader = async objectReportResume => {
  await ReportUploader.updateOne(
    { code: objectReportResume.code },
    {
      state: objectReportResume.state,
      percentageCompletition: objectReportResume.percentageCompletition,
      counterRows: objectReportResume.counterRows,
      message: objectReportResume.message,
      startDate: objectReportResume.startDate,
      endDate: objectReportResume.endDate,
      generatorUserId: objectReportResume.generatorUserId
    }
  );
};

exports.updateReportDownloader = async objectReportResume => {
  await ReportDownloader.updateOne(
    {
      code: objectReportResume.code,
      generatorUserId: objectReportResume.generatorUserId,
      reportType: objectReportResume.reportType
    },
    {
      state: objectReportResume.state,
      percentageCompletition: objectReportResume.percentageCompletition,
      counterRows: objectReportResume.counterRows,
      message: objectReportResume.message,
      startDate: objectReportResume.startDate,
      endDate: objectReportResume.endDate,
      generatorUserId: objectReportResume.generatorUserId,
      reportType: objectReportResume.reportType
    }
  );
};
