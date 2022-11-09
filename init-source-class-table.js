const LineByLine = require('n-readlines');

const {
  checkLineStartWithDoubleSlash,
  arrayChunk,
  arraysPromisePool,
} = require('./utils');
const { getAllSourceFiles, insertSourceClassTable } = require('./dao');

const convertDeclareClassLineToClassObject = (line) => {
  const classKeyword = 'class ';
  const classKeywordIndex = line.indexOf(classKeyword);
  const extendsKeyword = 'extends ';
  const extendsKeywordIndex = line.indexOf(extendsKeyword);
  const openCurlyBracketsSymbol = '{';
  const openCurlyBracketsSymbolIndex = line.lastIndexOf(
    openCurlyBracketsSymbol,
  );
  const classNameStartIndex = classKeywordIndex + classKeyword.length;

  if (extendsKeywordIndex === -1) {
    return {
      className: line
        .substring(classNameStartIndex, openCurlyBracketsSymbolIndex)
        .trim(),
    };
  }

  const parentClassNameStartIndex = extendsKeywordIndex + extendsKeyword.length;
  return {
    className: line.substring(classNameStartIndex, extendsKeywordIndex).trim(),
    parentClassName: line
      .substring(parentClassNameStartIndex, openCurlyBracketsSymbolIndex)
      .trim(),
  };
};

const getClassObjectsInFile = async ({ id, folderPath, fileName }) => {
  const lineReader = new LineByLine(folderPath + '\\' + fileName);
  const classKeyword = 'class ';
  const openCurlyBracketsSymbol = '{';
  const classObjects = [];
  let line = '';
  let declareClassLine = '';
  let isDeclareClassLineInMultpleRows = false;

  while ((line = lineReader.next())) {
    line = line.toString().trim();
    if (checkLineStartWithDoubleSlash(line)) {
      continue;
    }

    if (line.includes(classKeyword)) {
      declareClassLine = line;
    } else {
      if (!isDeclareClassLineInMultpleRows) {
        continue;
      }
      declareClassLine += ' ' + line;
    }

    if (declareClassLine.includes(openCurlyBracketsSymbol)) {
      const classObject = {
        ...convertDeclareClassLineToClassObject(declareClassLine),
        fileId: id,
      };
      classObjects.push(classObject);
      isDeclareClassLineInMultpleRows = false;
    } else {
      isDeclareClassLineInMultpleRows = true;
    }
  }

  return classObjects;
};

const getSourceClassesByTraceFiles = async (files) => {
  const chunkCount = files.length / 10 + 1;
  const fileChunks = arrayChunk(files, chunkCount);
  const classObjects = [];
  const classNameMap = new Map();

  const fileHandler = async (sourceFile) => {
    const classObjectsInFile = await getClassObjectsInFile(sourceFile);
    classObjectsInFile.forEach((classObject) => {
      const classId = classObjects.length;
      classObjects.push(classObject);
      classNameMap.set(classObject.className, classId);
    });
  };
  await arraysPromisePool(fileHandler, fileChunks);

  const sourceClasses = classObjects.map((classObject) => {
    return {
      id: classObject.id,
      className: classObject.className,
      fileId: classObject.fileId,
      parentId: classNameMap.get(classObject.parentClassName),
    };
  });

  return sourceClasses;
};

const initSourceClassTable = async () => {
  const sourceFiles = await getAllSourceFiles();
  const sourceClasses = await getSourceClassesByTraceFiles(sourceFiles);

  const chunkCount = sourceClasses.length / 10 + 1;
  const sourceClassChunks = arrayChunk(sourceClasses, chunkCount);
  const sourceClassHandler = async (sourceClass) => {
    await insertSourceClassTable(sourceClass);
  };
  await arraysPromisePool(sourceClassHandler, sourceClassChunks);

  console.log('Init successfully');
};

module.exports = {
  initSourceClassTable,
};
