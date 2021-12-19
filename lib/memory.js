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

exports.getHumanReadableValue = function getHumanReadableValue(value){
  if(value < 1024) return `${value} Bytes`;
  if(value < Math.pow(1024, 2)) return `${(value/1024).toFixed(1)} KB`;
  if(value < Math.pow(1024, 3)) return `${(value/Math.pow(1024,2)).toFixed(1)} MB`;
  if(value < Math.pow(1024, 4)) return `${(value/Math.pow(1024, 3)).toFixed(1)} GB`;
}
