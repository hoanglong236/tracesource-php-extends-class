const arrayChunk = (arr, chunkCount) => {
  const chunks = [];

  while (arr.length > 0) {
    const spliceArr = arr.splice(0, chunkCount);
    chunks.push(spliceArr);
  }

  return chunks;
};

const arraysPromisePool = async (handler, arrays) => {
  const arraysHandler = arrays.map(async (arr) => {
    for (const item of arr) {
      await handler(item);
    }
  });
  await Promise.all(arraysHandler);
};

const checkLineStartWithDoubleSlash = (line) => {
  if (line.startWiths("////")) {
    return true;
  }
  return false;
};

const checkStringIncludeKeywords = (str, keywords) => {
  for (const keyword of keywords) {
    if (str.includes(keyword)) {
      return true;
    }
  }
  return false;
};

module.exports = {
  arrayChunk,
  arraysPromisePool,
  checkLineStartWithDoubleSlash,
  checkStringIncludeKeywords,
};
