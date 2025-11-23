const { createLogger, format, transports } = require('winston');
const { combine, label, timestamp, printf, splat } = format;

// Default module name
const moduleName = 'auth-backend';

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const myConfig = {
  levels: {
    error: 0,
    warn: 1,
    data: 2,
    info: 3,
    debug: 4,
    verbose: 5,
    silly: 6,
    http: 7,
  },
  colors: {
    error: 'red',
    warn: 'orange',
    data: 'grey',
    info: 'green',
    debug: 'yellow',
    verbose: 'cyan',
    silly: 'magenta',
    http: 'magenta',
  },
};

const myConfiglevelsKeyArray = Object.keys(myConfig.levels);

const winstonLogOptions = {
  levels: myConfig.levels,
  format: combine(
    label({ label: moduleName }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.splat(),
    format.simple(),
    myFormat
  ),
  transports: [
    new transports.Console({
      level: `${myConfiglevelsKeyArray[myConfiglevelsKeyArray.length - 1]}`,
      format: combine(format.colorize(), myFormat),
    }),
  ],
};

// Add colors to winston
require('winston').addColors(myConfig.colors);

const winstonLog = createLogger({ ...winstonLogOptions });

// Info log function
const InfoLog = (msg, data, module) => {
  const logLabel = module || moduleName;
  if (data !== undefined || data !== null || data !== '' || data !== 'null') {
    // Use JSON.stringify for better nested object display
    const formattedData = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
    winstonLog.log('info', `${msg}: ${formattedData}`, { label: logLabel });
  } else {
    winstonLog.log('info', msg, { label: logLabel });
  }
};

// Error log function
const ErrorLog = (msg, error, module) => {
  const logLabel = module || moduleName;
  if (error !== undefined) {
    // Use JSON.stringify for better nested object display
    const formattedError = typeof error === 'object' ? JSON.stringify(error, null, 2) : error;
    winstonLog.log('error', `${msg}: ${formattedError}`, { label: logLabel });
  } else {
    winstonLog.log('error', msg, { label: logLabel });
  }
};

module.exports = {
  InfoLog,
  ErrorLog,
  winstonLog,
};
