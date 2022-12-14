const { SOURCE_FILE_TABLE, SOURCE_CLASS_TABLE, SOURCE_FUNCTION_TABLE, FUNCTION_INVOKER_TABLE } = require('./data');

const getSourceFileSql = () => {
  return `SELECT * FROM ${SOURCE_FILE_TABLE} ORDER BY id`;
}

const getSourceClassSql = () => {
  return `SELECT * FROM ${SOURCE_CLASS_TABLE} ORDER BY id`;
}

const getSourceFunctionSql = () => {
  return `SELECT * FROM ${SOURCE_FUNCTION_TABLE} ORDER BY id`;
}

const getFunctionInvokerSql = () => {
  return `SELECT * FROM ${FUNCTION_INVOKER_TABLE} ORDER BY id`;
}

const getTraceSourceResultSql = () => {
  const sql = 
    `WITH function_invoker_temp AS (\n` +
    `  SELECT source_file.file_name AS invoker_function_file_name\n` +
    `    , source_function.file_id AS function_file_id\n` +
    `    , source_function.function_signature AS signature\n` +
    `    , source_function.function_name\n` +
    `    , function_invoker.line_number\n` +
    `    , function_invoker.line_content\n` +
    `  FROM ${FUNCTION_INVOKER_TABLE} function_invoker\n` +
    `  INNER JOIN ${SOURCE_FUNCTION_TABLE} source_function ON source_function.id = function_invoker.invoked_function_id\n` +
    `  INNER JOIN ${SOURCE_FILE_TABLE} source_file ON source_file.id = function_invoker.file_id\n` +
    `)\n` +
    `SELECT source_file.file_name AS function_file_name\n` +
    `  , function_invoker_temp.invoker_function_file_name\n` +
    `  , function_invoker_temp.signature\n` +
    `  , function_invoker_temp.function_name\n` +
    `  , function_invoker_temp.line_number\n` +
    `  , function_invoker_temp.line_content\n` +
    `FROM function_invoker_temp\n` + 
    `INNER JOIN ${SOURCE_FILE_TABLE} source_file ON source_file.id = function_invoker_temp.function_file_id\n` +
    `GROUP BY source_file.file_name\n` +
    `  , function_invoker_temp.invoker_function_file_name\n` +
    `  , function_invoker_temp.signature\n` +
    `  , function_invoker_temp.function_name\n` +
    `  , function_invoker_temp.line_number\n` +
    `  , function_invoker_temp.line_content\n` +
    `ORDER BY source_file.file_name\n` +
    `  , function_invoker_temp.invoker_function_file_name\n` +
    `  , function_invoker_temp.signature\n` +
    `  , function_invoker_temp.function_name\n` +
    `  , function_invoker_temp.line_number\n` +
    `  , function_invoker_temp.line_content\n`

    return sql;
}