exports.getBytes = function getBytes(value) {
  const sizes = { kb: 1, mb: 2, gb: 3 };
  const parsedMemoryValue = value.match(/^(\d+)(kb|mb|gb)$/i);
  if (!parsedMemoryValue) {
    throw new Error(
      `Invalid memory value: ${value}. Syntax is invalid. Examples: 12Kb, 1Mb e.t.c`
    );
  }
  return (
    parsedMemoryValue[1] *
    Math.pow(1024, sizes[parsedMemoryValue[2].toLowerCase()])
  );
};
