const { postGreConnection } = require('./postgre-connection');
const {
  SOURCE_FILE_TABLE,
  SOURCE_CLASS_TABLE,
  SOURCE_FUNCTION_TABLE,
  FUNCTION_INVOKER_TABLE,
  ROOT_FILES,
} = require('./data');

const executeCreateTableQuery = async (sql, tableName) => {
  await postGreConnection
    .query(sql)
    .then((res) => {
      console.log(`Create table ${tableName} successfully`);
    })
    .catch((err) => {
      console.log(`Create table ${tableName} failed!!!`);
      console.log(err);
    });
};

const createSourceFileTable = async () => {
  const sql =
    `CREATE TABLE ${SOURCE_FILE_TABLE} (\n` +
    `  id INT,\n` +
    `  folder_path VARCHAR(500),\n` +
    `  file_name VARCHAR(150)\n` +
    `)`;

  await executeCreateTableQuery(sql, SOURCE_FILE_TABLE);
};

const createSourceClassTable = async () => {
  const sql =
    `CREATE TABLE ${SOURCE_CLASS_TABLE} (\n` +
    `  id INT,\n` +
    `  class_name VARCHAR(150),\n` +
    `  file_id INT,\n` +
    `  parent_id INT\n` +
    `)`;

  await executeCreateTableQuery(sql, SOURCE_CLASS_TABLE);
};

const createSourceFunctionTable = async () => {
  const sql =
    `CREATE TABLE ${SOURCE_FUNCTION_TABLE} (\n` +
    `  id INT,\n` +
    `  function_signature VARCHAR(500),\n` +
    `  function_name VARCHAR(150),\n` +
    `  file_id INT\n` +
    `)`;

  await executeCreateTableQuery(sql, SOURCE_FUNCTION_TABLE);
};

const createFunctionInvokerTable = async () => {
  const sql =
    `CREATE TABLE ${FUNCTION_INVOKER_TABLE} (\n` +
    `  id INT,\n` +
    `  line_number INT,\n` +
    `  line_content VARCHAR(500),\n` +
    `  file_id INT,\n` +
    `  invoked_function_id INT\n` +
    `)`;

  await executeCreateTableQuery(sql, FUNCTION_INVOKER_TABLE);
};

const executeInsertTableQuery = async (sql, queryParams, tableName) => {
  await postGreConnection
    .query(sql, queryParams)
    .then((res) => {
      console.log(
        `Insert into ${tableName} with [id: ${queryParams[0]}] successfully`,
      );
    })
    .catch((err) => {
      console.log(`Insert into ${tableName} failed!!!`);
      console.log(`Query params: ${queryParams}`);
      console.log(err);
    });
};

const insertSourceFileTable = async ({ id, folderPath, fileName }) => {
  const sql = `INSERT INTO ${SOURCE_FILE_TABLE} VALUES($1, $2, $3)`;
  const params = [id, folderPath, fileName];

  await executeInsertTableQuery(sql, params, SOURCE_FILE_TABLE);
};

const insertSourceClassTable = async ({ id, className, fileId, parentId }) => {
  const sql = `INSERT INTO ${SOURCE_CLASS_TABLE} VALUES($1, $2, $3, $4)`;
  const params = [id, className, fileId, parentId];

  await executeInsertTableQuery(sql, params, SOURCE_CLASS_TABLE);
};

const insertSourceFunctionTable = async ({
  id,
  functionSignature,
  functionName,
  fileId,
}) => {
  const sql = `INSERT INTO ${SOURCE_FUNCTION_TABLE} VALUES($1, $2, $3, $4)`;
  const params = [id, functionSignature, functionName, fileId];

  await executeInsertTableQuery(sql, params, SOURCE_FUNCTION_TABLE);
};

const insertFunctionInvokerTable = async ({
  id,
  lineNumber,
  lineContent,
  fileId,
  invokedFunctionId,
}) => {
  const sql = `INSERT INTO ${FUNCTION_INVOKER_TABLE} VALUES($1, $2, $3, $4, $5)`;
  const params = [id, lineNumber, lineContent, fileId, invokedFunctionId];

  await executeInsertTableQuery(sql, params, FUNCTION_INVOKER_TABLE);
};

const deleteAllRecordsInTable = async (tableName) => {
  const sql = `DELETE FROM ${tableName}`;

  await postGreConnection
    .query(sql)
    .then((res) => {
      console.log(`Delete old records from table ${tableName} successfully`);
    })
    .catch((err) => {
      console.log(`Delete old records from table ${tableName} failed!!!`);
      console.log(err);
    });
};

const getSourceFilesFromQueryResult = (queryResult) => {
  return queryResult.rows.map((row) => {
    return {
      id: row.id,
      folderPath: row.folder_path,
      fileName: row.file_name,
    };
  });
};

const getSourceFileFromQueryResult = (queryResult) => {
  const firstRecord = queryResult.rows[0];

  return {
    id: firstRecord.id,
    folderPath: firstRecord.folder_path,
    fileName: firstRecord.file_name,
  };
};

const getAllSourceFiles = async () => {
  const sql = `SELECT * FROM ${SOURCE_FILE_TABLE}`;

  return await postGreConnection
    .query(sql)
    .then((result) => {
      return getSourceFilesFromQueryResult(result);
    })
    .catch((err) => {
      console.log(err);
      return;
    });
};

const getSourceFileByFileId = async (fileId) => {
  const sql = `SELECT * FROM ${SOURCE_FILE_TABLE} WHERE id = $1`;
  const params = [fileId];

  return await postGreConnection
    .query(sql, params)
    .then((result) => {
      return getSourceFileFromQueryResult(result);
    })
    .catch((err) => {
      console.log(err);
      return;
    });
};

const getSourceFileByFolderPathAndFileName = async ({
  folderPath,
  fileName,
}) => {
  const sql =
    `SELECT * FROM ${SOURCE_FILE_TABLE}\n` +
    `WHERE folder_path = $1 AND file_name = $2`;
  const params = [folderPath, fileName];

  return await postGreConnection
    .query(sql, params)
    .then((result) => {
      return getSourceFileFromQueryResult(result);
    })
    .catch((err) => {
      console.log(err);
      return;
    });
};

const getRootSourceFiles = async () => {
  const getRootSourceFilesHandler = ROOT_FILES.map(async (rootFile) => {
    return await getSourceFileByFolderPathAndFileName(rootFile);
  });

  return await Promise.all(getRootSourceFilesHandler)
    .then((values) => {
      return values;
    })
    .catch((err) => {
      console.log(err);
      return [];
    });
};

const getSourceClassesByFileId = async (fileId) => {
  const sql = `SELECT * FROM ${SOURCE_CLASS_TABLE} WHERE file_id = $1`;
  const params = [fileId];

  return await postGreConnection
    .query(sql, params)
    .then((res) => {
      return res.rows.map((row) => {
        return {
          id: row.id,
          className: row.class_name,
          fileId: row.file_id,
          parentId: row.parent_id,
        };
      });
    })
    .catch((err) => {
      console.log(err);
      return;
    });
};

const getClassSourceFilesByParentClassFileId = async (fileId) => {
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
  const params = [fileId];

  return await postGreConnection
    .query(sql, params)
    .then((result) => {
      return getSourceFilesFromQueryResult(result);
    })
    .catch((err) => {
      console.log(err);
      return;
    });
};

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

  const params = [fileId];

  return await postGreConnection
    .query(sql, params)
    .then((result) => {
      return getSourceFilesFromQueryResult(result);
    })
    .catch((err) => {
      console.log(err);
      return;
    });
};

const getSourceFunctionsByFileId = async (fileId) => {
  const sql = `SELECT * FROM ${SOURCE_FUNCTION_TABLE} WHERE file_id = $1`;
  const params = [fileId];

  return await postGreConnection
    .query(sql, params)
    .then((res) => {
      return res.rows.map((row) => {
        return {
          id: row.id,
          functionSignature: row.function_signature,
          functionName: row.function_name,
          fileId: row.file_id,
        };
      });
    })
    .catch((err) => {
      console.log(err);
      return;
    });
};

module.exports = {
  createSourceFileTable,
  createSourceClassTable,
  createSourceFunctionTable,
  createFunctionInvokerTable,
  insertSourceFileTable,
  insertSourceClassTable,
  insertSourceFunctionTable,
  insertFunctionInvokerTable,
  deleteAllRecordsInTable,
  getAllSourceFiles,
  getSourceFileByFileId,
  getSourceFileByFolderPathAndFileName,
  getRootSourceFiles,
  getSourceClassesByFileId,
  getClassSourceFilesByParentClassFileId,
  getRecursiveClassSourceFilesByParentClassFileId,
  getSourceFunctionsByFileId,
};
