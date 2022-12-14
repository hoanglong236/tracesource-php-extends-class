const LineByLine = require('n-readlines');

const {
  getSourceFunctionsByFileId,
  getClassSourceFilesByParentClassFileId,
  getRecursiveClassSourceFilesByParentClassFileId,
  insertFunctionInvokerTable,
  getRootSourceFiles,
} = require('./dao');
const {
  checkLineStartWithDoubleSlash,
  arrayChunk,
  arraysPromisePool,
} = require('./utils');

const getInvokersInFileOfFunctions = async (file, sourceFunctions) => {
  const lineReader = new LineByLine(file.folderPath + '\\' + file.fileName);
  const functionInvokers = [];
  let lineNumber = 0;
  let line = '';

  // because function name in php is case insensitive
  sourceFunctions.forEach((sourceFunction) => {
    sourceFunction.functionName = sourceFunction.functionName.toLowerCase();
  });

  while ((line = lineReader.next())) {
    lineNumber++;
    line = line.toString().trim();
    const lineLowerCase = line.toLowerCase();

    if (checkLineStartWithDoubleSlash(line)) {
      continue;
    }

    for (const sourceFunction of sourceFunctions) {
      if (
        lineLowerCase.includes('->' + sourceFunction.functionName) ||
        lineLowerCase.includes('self::' + sourceFunction.functionName)
      ) {
        functionInvokers.push({
          lineNumber: lineNumber,
          lineContent: line,
          fileId: file.id,
          invokedFunctionId: sourceFunction.id,
        });
      }
    }
  }

  return functionInvokers;
};

const getInvokersOfFunctionsInFile = async (file) => {
  const sourceFunctions = await getSourceFunctionsByFileId(file.id);
  const childClassSourceFiles = await getClassSourceFilesByParentClassFileId(file.id);
  // const childSourceClassFiles = await getRecursiveClassSourceFilesByParentClassFileId(file.id);

  const functionInvokers = [];
  const fillFunctionInvokers = childClassSourceFiles.map(async (childFile) => {
    const functionInvokersInFile = await getInvokersInFileOfFunctions(
      childFile,
      sourceFunctions,
    );
    functionInvokers.push(...functionInvokersInFile);
  });

  await Promise.all(fillFunctionInvokers);
  return functionInvokers;
};

const getInvokersOfFunctionsInRootFiles = async () => {
  const functionInvokers = [];

  const rootSourceFiles = await getRootSourceFiles();
  const fillFunctionInvokers = rootSourceFiles.map(async (rootFile) => {
    const invokersInFile = await getInvokersOfFunctionsInFile(rootFile);
    functionInvokers.push(...invokersInFile);
  });

  await Promise.all(fillFunctionInvokers);
  return functionInvokers;
};

const initFunctionInvokerTable = async () => {
  const functionInvokers = await getInvokersOfFunctionsInRootFiles();
  functionInvokers.forEach((item, index) => {
    item.id = index;
  });

  const chunkCount = functionInvokers.length / 10 + 1;
  const functionInvokerChunks = arrayChunk(functionInvokers, chunkCount);
  const functionInvokerHandler = async (functionInvoker) => {
    await insertFunctionInvokerTable(functionInvoker);
  };
  await arraysPromisePool(functionInvokerHandler, functionInvokerChunks);

  console.log('Init function-invoker-table successfully');
};

module.exports = {
  initFunctionInvokerTable,
};
