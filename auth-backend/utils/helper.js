const { AxiosError } = require('axios');
const { isNil, isEmpty } = require('lodash');

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function filterSensitiveData(data) {
  try {
    if (!data) return data;
    if (typeof data !== 'object') return data; // If data is not an object or array, return it as is
    if (Array.isArray(data)) {
      return data.map((item) => filterSensitiveData(item));
    }
    const sensitiveFields = [
      'password',
      'newpassword',
      'walletPin',
      'userPin',
      'sourceWalletPin',
      'pin',
      'cardCavv',
      'cavv',
      'expiry',
      'cardExpiry',
    ].map((field) => field.toLowerCase());

    const cardNumberFields = ['cardNumber', 'encryptedCardNumber'].map((field) => field.toLowerCase());

    const filteredData = JSON.parse(JSON.stringify(data));

    if (typeof filteredData === 'object' && filteredData !== null) {
      Object.keys(filteredData).forEach((key) => {
        const lowerCaseKey = key.toLowerCase();

        if (sensitiveFields.includes(lowerCaseKey)) {
          filteredData[key] = '[FILTERED]';
        } else if (cardNumberFields.includes(lowerCaseKey) && filteredData[key]) {
          filteredData[key] = filterSensitiveData(filteredData[key]);
        } else if (typeof filteredData[key] === 'object' && filteredData[key] !== null) {
          filteredData[key] = filterSensitiveData(filteredData[key]);
        }
      });
    }
    return filteredData;
  } catch (error) {
    console.error('Error filtering sensitive data:', error);
    return data; // Return original data in case of error
  }
}

function safeObjectMaker(obj) {
  const safeObj = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (!isNil(value) && !isEmpty(value)) {
      safeObj[key] = value;
    }
  });
  return safeObj;
}
function cleanAxiosError(error) {
  try {
    // Extract basic request info
    const method = error?.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error?.config?.url || 'UNKNOWN_URL';

    // Extract response data if available
    const status = error?.response?.status;
    const statusText = error?.response?.statusText;
    const responseData = error?.response?.data;

    // Extract request details
    const requestParams = error?.config?.params;

  const requestBody = error?.config?.data
    ? isJsonString(error?.config?.data)
      ? JSON.parse(error?.config?.data)
      : error?.config?.data
    : undefined;


    return {
      request: {
        method,
        url,
        params: filterSensitiveData(requestParams),
        body: filterSensitiveData(requestBody),
      },
      response: status
        ? {
            status,
            statusText,
            data: filterSensitiveData(responseData),
          }
        : undefined,
      message: error?.message || 'Unknown error',
      name: error?.name || 'Error',
    };
  } catch (cleanError) {
    // Fallback if cleaning fails
    return {
      message: error?.message || 'Unknown error',
      name: error?.name || 'Error',
      originalError: 'Error occurred while cleaning axios error',
    };
  }
}

function ErrorFilter(error) {
  if (error instanceof AxiosError) {
    console.dir(cleanAxiosError(error), { depth: null, colors: true });
    return
  }
  return {
    message: error?.message || 'Unknown error',
    name: error?.name || 'Error',
  };
}

module.exports = {
  isJsonString,
  filterSensitiveData,
  safeObjectMaker,
  ErrorFilter,
  cleanAxiosError
};
