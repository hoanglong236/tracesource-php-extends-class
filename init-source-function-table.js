const LineByLine = require('n-readlines');

const {
  checkLineStartWithDoubleSlash,
  checkStringIncludeKeywords,
  arrayChunk,
  arraysPromisePool,
} = require('./utils');
const { insertSourceFunctionTable, getRootSourceFiles } = require('./dao');

const convertDeclareFunctionLineToSourceFunction = (line) => {
  const functionKeyword = 'function ';
  const functionKeywordIndex = line.indexOf(functionKeyword);
  const openRoundBracketsSymbol = '(';
  const openRoundBracketsSymbolIndex = line.indexOf(openRoundBracketsSymbol);
  const closeRoundBracketsSymbol = ')';
  const closeRoundBracketsSymbolIndex = line.lastIndexOf(
    closeRoundBracketsSymbol,
  );

  const startFunctionNameIndex = functionKeywordIndex + functionKeyword.length;
  const functionSignature = line
    .substring(startFunctionNameIndex, closeRoundBracketsSymbolIndex + 1)
    .toString();
  const functionName = line
    .substring(startFunctionNameIndex, openRoundBracketsSymbolIndex)
    .trim();

  return {
    functionSignature: functionSignature,
    functionName: functionName,
  };
};

const getSourceFunctionsInFile = async ({ id, folderPath, fileName }) => {
  const lineReader = new LineByLine(folderPath + '\\' + fileName);
  const ignoreKeywords = ['private '];
  const functionKeyword = 'function ';
  const openCurlyBracketsSymbol = '{';
  const sourceFunctions = [];
  let line = '';
  let declareFunctionLine = '';
  let isDeclareFunctionLineInMultipleRows = false;

  while ((line = lineReader.next())) {
    line = line.toString().trim();
    if (checkLineStartWithDoubleSlash(line)) {
      continue;
    }

    if (line.includes(functionKeyword)) {
      if (checkStringIncludeKeywords(line, ignoreKeywords)) {
        continue;
      }
      declareFunctionLine = line;
    } else {
      if (!isDeclareFunctionLineInMultipleRows) {
        continue;
      }
      declareFunctionLine += ' ' + line;
    }

    if (declareFunctionLine.includes(openCurlyBracketsSymbol)) {
      const sourceFunction = {
        ...convertDeclareFunctionLineToSourceFunction(declareFunctionLine),
        fileId: id,
      };
      sourceFunctions.push(sourceFunction);
      isDeclareFunctionLineInMultipleRows = false;
    } else {
      isDeclareFunctionLineInMultipleRows = true;
    }
  }

  return sourceFunctions;
};

const getSourceFunctionsByTraceFiles = async (files) => {
  const sourceFunctions = [];
  const fillSourceFunctionsHandler = files.map(async (file) => {
    const sourceFunctionsInFile = await getSourceFunctionsInFile(file);
    sourceFunctions.push(...sourceFunctionsInFile);
  });

  await Promise.all(fillSourceFunctionsHandler);

  sourceFunctions.forEach((sourceFunction, index) => {
    sourceFunction.id = index;
  });

  return sourceFunctions;
};

const getSourceFunctionsByTraceRootFiles = async () => {
  const rootSourceFiles = await getRootSourceFiles();
  const sourceFunctions = await getSourceFunctionsByTraceFiles(rootSourceFiles);
  return sourceFunctions;
};

const initSourceFunctionTable = async () => {
  const sourceFunctions = await getSourceFunctionsByTraceRootFiles();

  const sourceFunctionChunks = arrayChunk(
    sourceFunctions,
    sourceFunctions.length / 10,
  );
  const sourceFunctionHandler = async (sourceFunction) => {
    await insertSourceFunctionTable(sourceFunction);
  };
  await arraysPromisePool(sourceFunctionHandler, sourceFunctionChunks);

  console.log('Init source-function-table successfully');
};

module.exports = {
  initSourceFunctionTable,
};
