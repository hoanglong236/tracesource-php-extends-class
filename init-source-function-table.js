const LineByLine = require("n-readlines");

const {
  checkLineStartWithDoubleSlash,
  checkStringIncludeKeywords,
} = require("./utils");

const separateDeclareFunctionLine = (line) => {
  const functionKeyword = "function ";
  const functionKeywordIndex = line.indexOf(functionKeyword);
  const openRoundBracketsSymbol = "(";
  const openRoundBracketsSymbolIndex = line.indexOf(openRoundBracketsSymbol);
  const closeRoundBracketsSymbol = ")";
  const closeRoundBracketsSymbolIndex = line.lastIndexOf(
    closeRoundBracketsSymbol
  );

  const startFunctionNameIndex = functionKeywordIndex + functionKeyword.length;
  const functionSignature = line
    .substring(startFunctionNameIndex, closeRoundBracketsSymbolIndex)
    .toString();
  const functionName = line
    .substring(startFunctionNameIndex, openRoundBracketsSymbolIndex)
    .trim();

  return {
    functionSignature: functionSignature,
    functionName: functionName,
  };
};

const getFunctionObjectsInFile = async ({ id, fileName, folderPath }) => {
  const lineReader = new LineByLine(folderPath + "\\" + fileName);
  const ignoreKeywords = ["private "];
  const functionKeyword = "function ";
  const openCurlyBracketsSymbol = "{";
  const functionObjects = [];
  let line = "";
  let declareFunctionLine = "";
  let isDeclareFunctionLineInMultpleRows = false;

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
      if (!isDeclareFunctionLineInMultpleRows) {
        continue;
      }
      declareFunctionLine += " " + line;
    }

    if (declareFunctionLine.includes(openCurlyBracketsSymbol)) {
      functionObjects.push({
        ...separateDeclareFunctionLine(declareFunctionLine),
        fileId: id,
      });
      isDeclareFunctionLineInMultpleRows = false;
    } else {
      isDeclareFunctionLineInMultpleRows = true;
    }
  }

  return functionObjects;
};

const getSourceFunctionsFromFiles = () => {
  const sourceFunctions = [];
  sourceFiles.map((sourceFile) => {
    const functionObjectsInFile = getFunctionObjectsInFile(sourceFile);
  })
}

const getRootSourceFiles = async () => {
  const getRootSourceFilesHandler = ROOT_FILES.map(async (rootFile) => {
    return await getSourceFileByFolderPathAndFileName(
      rootFile.folderPath,
      rootFile.fileName
    );
  });

  return await Promise.all(getRootSourceFilesHandler)
    .then((values) => {
      return values;
    })
    .catch((err) => {
      console.log(err);
      return [];
    });
}

const getSourceFunctionsFromRootFiles = async () => {
  const rootSourcFiles = await getRootSourceFiles();
};

// BUGS!!!