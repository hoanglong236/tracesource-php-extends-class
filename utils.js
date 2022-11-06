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

module.exports = {
  arrayChunk,
  arraysPromisePool,
};
