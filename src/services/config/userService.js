const admin = require('../../firebase/admin');

const ApiError = require('../../dto/commons/response/apiErrorDTO');
const ServiceException = require('../../utils/errors/serviceException');
const commonErrors = require('../../utils/constants/commonErrors');
const accessControlMessages = require('../../utils/constants/accessControlMessages');
const httpCodes = require('../../utils/constants/httpCodes');

exports.validateUser = async (req, res) => {
  try {
    let token;
    let user;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      throw new ServiceException(
        commonErrors.E_COMMON_01,
        new ApiError(
          `${accessControlMessages.E_ACCESS_CONTROL_MS_02}`,
          `${accessControlMessages.E_ACCESS_CONTROL_MS_02}`,
          'E_ACCESS_CONTROL_MS_02',
          httpCodes.UNAUTHORIZED
        )
      );
    }

    await admin
      .auth()
      .verifyIdToken(token)
      .then(decodedToken => {
        user = decodedToken;
      })
      .catch(error => {
        throw new ServiceException(
          commonErrors.E_COMMON_01,
          new ApiError(
            `Usuario no autorizado`,
            `Usuario no autorizado`,
            'E_ACCESS_CONTROL_MS_03',
            httpCodes.UNAUTHORIZED
          )
        );
      });
    return user;
  } catch (error) {
    throw error;
  }
};
