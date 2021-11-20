exports.getMiliseconds = function (value) {
  const parsedTimeValue = value.match(/^(\d+)([smhd])$/);
  if (!parsedTimeValue) {
    throw new Error(
      `Invalid time value: ${value}. Syntax is invalid. Examples: 10s, 2m, 1h e.t.c`
    );
  }
  switch (parsedTimeValue[2]) {
    case 's':
      return parsedTimeValue[1] * 1000;
    case 'm':
      return parsedTimeValue[1] * 60 * 1000;
    case 'h':
      return parsedTimeValue[1] * 60 * 60 * 1000;
    default:
      return null;
  }
};

exports.delay = async function (delay) {
  return new Promise((resolve, reject) => setTimeout(resolve, delay));
};
