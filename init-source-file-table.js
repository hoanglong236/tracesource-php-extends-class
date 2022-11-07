const fs = require("fs");

const {
  FILE_EXTENSIONS,
  IGNORE_FOLDERS,
  TRACE_FOLDER_PATHS,
} = require("./data");
const { insertSourceFileTable } = require("./dao");
const { arrayChunk, arraysPromisePool } = require("./utils");

const isIgnoreFolder = (folderPath) => {
  for (const ignoreFolder of IGNORE_FOLDERS) {
    if (folderPath.includes(ignoreFolder)) {
      return true;
    }
  }
  return false;
};

const checkFileExtension = (fileName) => {
  const lastDotSymbolIndex = fileName.lastIndexOf(".");
  if (lastDotSymbolIndex === -1) {
    return false;
  }

  const fileExtension = fileName.substring(lastDotSymbolIndex + 1);
  if (FILE_EXTENSIONS(fileExtension)) {
    return true;
  }

  return false;
};

const convertFilePathToFile = (filePath) => {
  const lastDotSymbolIndex = fileName.lastIndexOf(".");
  const folderPath = fileName.substring(0, lastDotSymbolIndex);
  const fileName = fileName.substring(lastDotSymbolIndex + 1);

  return {
    folderPath: folderPath,
    fileName: fileName,
  };
};

const tracedFiles = [];

const traceFileDPS = (filePath) => {
  const fileStats = fs.fstatSync(filePath);
  if (fileStats.isDirectory()) {
    if (!isIgnoreFolder(filePath)) {
      const childFiles = fs.readdirSync(filePath);
      for (const childFile of childFiles) {
        traceFileDPS(filePath + "\\" + childFile);
      }
    }
    return;
  }

  const currentFile = convertFilePathToFile(filePath);
  if (checkFileExtension(currentFile.fileName)) {
    tracedFiles.push(currentFile);
  }
};

const initSourceFileTable = async () => {
  TRACE_FOLDER_PATHS.forEach((folderPath) => {
    traceFileDPS(folderPath);
  });

  const tracedFileChunks = arrayChunk(tracedFiles, 1000);
  const tracedFileHandler = async (traceFile) => {
    await insertSourceFileTable(traceFile);
  };
  await arraysPromisePool(tracedFileHandler, tracedFileChunks);

  console.log("Init source-file-table successfully");
};

module.exports = {
  initSourceFileTable,
};