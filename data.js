const TRACE_FOLDERS = [];

const IGNORE_FOLDERS = [];

const FILE_EXTENSIONS = {
  php: true,
};

const ROOT_FILES = [
  {
    filePath: "",
    fileName: "",
  },
];

const SOURCE_FILE_TABLE = "source_file";
const SOURCE_CLASS_TABLE = "source_class";
const SOURCE_FUNCTION_TABLE = "source_function";
const INVOKER_FUNCTION_TABLE = "invoker_function";

module.exports = {
  TRACE_FOLDERS,
  IGNORE_FOLDERS,
  FILE_EXTENSIONS,
  ROOT_FILES,
  SOURCE_FILE_TABLE,
  SOURCE_CLASS_TABLE,
  SOURCE_FUNCTION_TABLE,
  INVOKER_FUNCTION_TABLE,
};
