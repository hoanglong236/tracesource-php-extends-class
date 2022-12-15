
const {
  SOURCE_FILE_TABLE,
  SOURCE_CLASS_TABLE,
  SOURCE_FUNCTION_TABLE,
  FUNCTION_INVOKER_TABLE,
  ROOT_FILES,
} = require('./data');


const createSourceFileTable = async () => {
  const sql =
    `CREATE TABLE ${SOURCE_FILE_TABLE} (\n` +
    `  id INT,\n` +
    `  folder_path VARCHAR(500),\n` +
    `  file_name VARCHAR(150)\n` +
    `)`;

  console.log(sql);
};

// createSourceFileTable();

const createSourceClassTable = async () => {
  const sql =
    `CREATE TABLE ${SOURCE_CLASS_TABLE} (\n` +
    `  id INT,\n` +
    `  class_name VARCHAR(150),\n` +
    `  file_id INT,\n` +
    `  parent_id INT\n` +
    `)`;

  console.log(sql);
};

// createSourceClassTable();

const createSourceFunctionTable = async () => {
  const sql =
    `CREATE TABLE ${SOURCE_FUNCTION_TABLE} (\n` +
    `  id INT,\n` +
    `  function_signature VARCHAR(500),\n` +
    `  function_name VARCHAR(150),\n` +
    `  file_id INT\n` +
    `)`;

  console.log(sql);
};

// createSourceFunctionTable();

const createFunctionInvokerTable = async () => {
  const sql =
    `CREATE TABLE ${FUNCTION_INVOKER_TABLE} (\n` +
    `  id INT,\n` +
    `  line_number INT,\n` +
    `  line_content VARCHAR(500),\n` +
    `  file_id INT,\n` +
    `  invoked_function_id INT\n` +
    `)`;

  console.log(sql);
};

// createFunctionInvokerTable();

const getSourceFileByFolderPathAndFileName = async () => {
  const sql =
    `SELECT * FROM ${SOURCE_FILE_TABLE}\n` +
    `WHERE folder_path = $1 AND file_name = $2`;
  
  console.log(sql);
};

// getSourceFileByFolderPathAndFileName();

const getSourceFileByFilePath = async () => {
  const sql =
    `SELECT * FROM ${SOURCE_FILE_TABLE}\n` +
    `WHERE (folder_path || '\\\\' || file_name) = $1`;

  console.log(sql);
};

// getSourceFileByFilePath();

const getClassSourceFilesByParentClassFileId = async () => {
  const childSourceClassWithClause =
    `child_class_file AS (\n` +
    `  SELECT DISTINCT file_id FROM ${SOURCE_CLASS_TABLE}\n` +
    `  WHERE parent_id IN (\n` +
    `    SELECT id FROM ${SOURCE_CLASS_TABLE} WHERE file_id = $1\n` +
    `  )\n` +
    `)`;

  const withClause = `WITH ${childSourceClassWithClause}\n`;
  const sql =
    withClause +
    `SELECT source_file.* FROM ${SOURCE_FILE_TABLE} source_file\n` +
    `INNER JOIN child_class_file ON child_class_file.file_id = source_file.id`;
  
  console.log(sql);
};

// getClassSourceFilesByParentClassFileId();

const getRecursiveClassSourceFilesByParentClassFileId = async (fileId) => {
  const treeSourceClassWithClause =
    `RECURSIVE tree_source_class(id, tree_path) AS (\n` +
    `  SELECT source_class.id, source_class.id::TEXT AS tree_path\n` +
    `  FROM ${SOURCE_CLASS_TABLE} source_class\n` +
    `  WHERE source_class.parent_id IS NULL\n` +
    `  UNION ALL\n` +
    `  SELECT source_class.id, source_class.id::TEXT || '->' || tree_source_class.tree_path AS tree_path\n` +
    `  FROM tree_source_class\n` +
    `  INNER JOIN ${SOURCE_CLASS_TABLE} source_class ON source_class.parent_id = tree_source_class.id\n` +
    `)`;

  const childSourceClassWithClause =
    `child_source_class AS (\n` +
    `  SELECT DISTINCT file_id FROM ${SOURCE_CLASS_TABLE}\n` +
    `  WHERE id IN (\n` +
    `    SELECT id FROM tree_source_class\n` +
    `    WHERE tree_path || '->' LIKE (\n` +
    `      SELECT '%->' || id::TEXT || '->%' FROM ${SOURCE_CLASS_TABLE} WHERE file_id = $1\n` +
    `    )\n` +
    `  )\n` +
    `)`;

  const withClause = `WITH ${treeSourceClassWithClause}, ${childSourceClassWithClause}\n`;
  const sql =
    withClause +
    `SELECT source_file.* FROM ${SOURCE_FILE_TABLE} source_file\n` +
    `INNER JOIN child_source_class ON child_source_class.file_id = source_file.id`;

  console.log(sql);
};

getRecursiveClassSourceFilesByParentClassFileId();