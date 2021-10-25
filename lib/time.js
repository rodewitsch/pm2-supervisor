exports.getMiliseconds = function (value) {
  const parsedTimeValue = value.match(/(\d+)(\w)/);
  if (!parsedTimeValue) {
    throw new Error(
      `Invalid time value: ${value}. Syntax is invalid. Examples: 10s, 2m, 1h e.t.c`
    );
  }
  if (!parsedTimeValue[1] || !+parsedTimeValue[1]) {
    throw new Error(
      `Invalid time value: ${value}. First time value must be an integer`
    );
  }
  if (
    typeof parsedTimeValue[2] !== 'string' ||
    (typeof parsedTimeValue[2] === 'string' && parsedTimeValue[2].length > 1)
  ) {
    throw new Error(
      `Invalid time value: ${value}. Last time value must be a character`
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
