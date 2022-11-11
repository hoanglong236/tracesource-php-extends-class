const LineByLine = require('n-readlines');

const {
  getSourceFunctionsByFileId,
  getChildSourceClassFilesByFileId,
  insertFunctionInvokerTable,
} = require('./dao');
const {
  getRootSourceFiles,
  checkLineStartWithDoubleSlash,
  arrayChunk,
  arraysPromisePool,
} = require('./utils');

const getInvokersInFileOfFunctions = async (file, sourceFunctions) => {
  const lineReader = new LineByLine(file.folderPath + '\\' + file.filename);
  const functionInvokers = [];
  let lineNumber = 0;

  // because function name in php is case insensitive
  sourceFunctions.forEach((sourceFunction) => {
    sourceFunction.name = sourceFunction.name.toLowerCase();
  });

  while ((line = lineReader.next())) {
    lineNumber++;
    line = line.toString().trim().toLowerCase();

    if (checkLineStartWithDoubleSlash(line)) {
      continue;
    }

    for (const sourceFunction of sourceFunctions) {
      if (line.includes('->' + sourceFunction.name)) {
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
  const childSourceClassFiles = await getChildSourceClassFilesByFileId(file.id);

  const functionInvokers = [];
  const fillFuncionInvokers = childSourceClassFiles.map(async (childFile) => {
    const functionInvokersInFile = await getInvokersInFileOfFunctions(
      childFile,
      sourceFunctions,
    );
    functionInvokers.push(...functionInvokersInFile);
  });

  await Promise.all(fillFuncionInvokers);
  return functionInvokers;
};

const getInvokersOfFunctionsInRootFiles = async () => {
  const functionInvokers = [];

  const rootSourceFiles = getRootSourceFiles();
  const rootSourceFileHandler = rootSourceFiles.map(async (rootFile) => {
    const invokersInFile = await getInvokersOfFunctionsInFile(file);
    functionInvokers.push(...invokersInFile);
  });
  await Promise.all(rootSourceFileHandler);

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
};

module.exports = {
  initFunctionInvokerTable,
};
