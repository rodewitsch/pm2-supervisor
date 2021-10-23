exports.log = function log(message, type = 'info') {
  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
  };
  switch (type) {
    case 'info': {
      console.log(colors.green, '[INFO]', colors.reset, message);
      break;
    }
    case 'error': {
      console.log(colors.red, '[ERROR]', colors.reset, message);
      break;
    }
    default: {
      console.log(colors.yellow, '[UNSPECIFIED]', colors.reset, message);
      break;
    }
  }
};
