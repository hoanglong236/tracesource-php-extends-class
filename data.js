const TRACE_FOLDER_PATHS = [];

const IGNORE_FOLDERS = [];

const FILE_EXTENSIONS = {
  php: true,
};

const ROOT_FILES = [
  {
    folderPath: '',
    fileName: '',
  },
];

const SOURCE_FILE_TABLE = 'source_file';
const SOURCE_CLASS_TABLE = 'source_class';
const SOURCE_FUNCTION_TABLE = 'source_function';
const INVOKER_FUNCTION_TABLE = 'invoker_function';

module.exports = {
  TRACE_FOLDER_PATHS,
  IGNORE_FOLDERS,
  FILE_EXTENSIONS,
  ROOT_FILES,
  SOURCE_FILE_TABLE,
  SOURCE_CLASS_TABLE,
  SOURCE_FUNCTION_TABLE,
  INVOKER_FUNCTION_TABLE,
};
