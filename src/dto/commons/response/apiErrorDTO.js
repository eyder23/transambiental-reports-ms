// Created By Eyder Ascuntar Rosales
class ApiError {
  constructor(messageUser, messageDeveloper, code, codeHTTP) {
    this.messageUser = messageUser;
    this.messageDeveloper = messageDeveloper;
    this.code = code;
    this.codeHTTP = codeHTTP;
  }

  applyData(json) {
    Object.assign(this, json);
  }
}
module.exports = ApiError;
