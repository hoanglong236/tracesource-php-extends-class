const { postGreConnection } = require("./postgre-connection");
const {
  SOURCE_FILE_TABLE,
  SOURCE_CLASS_TABLE,
  SOURCE_FUNCTION_TABLE,
  INVOKER_FUNCTION_TABLE,
} = require("./data");

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
    `CREATE TABLE ${SOURCE_FILE_TABLE} ( ` +
    `  id INT, ` +
    `  folder_path VARCHAR(500), ` +
    `  file_name VARCHAR(150), ` +
    `)`;

  await executeCreateTableQuery(sql, SOURCE_FILE_TABLE);
};

const createSourceClassTable = async () => {
  const sql =
    `CREATE TABLE ${SOURCE_CLASS_TABLE} ( ` +
    `  id INT, ` +
    `  class_name VARCHAR(150)` +
    `  file_id INT, ` +
    `  parent_id INT, ` +
    `)`;

  await executeCreateTableQuery(sql, SOURCE_CLASS_TABLE);
};

const createSourceFunctionTable = async () => {
  const sql =
    `CREAT TABLE ${SOURCE_FUNCTION_TABLE} ( ` +
    `  id INT, ` +
    `  signature VARCHAR(500), ` +
    `  name VARCHAR(150), ` +
    `  file_id INT` +
    `)`;

  await executeCreateTableQuery(sql, SOURCE_FUNCTION_TABLE);
};

const createInvokerFunctionTable = async () => {
  const sql =
    `CREATE TABLE ${INVOKER_FUNCTION_TABLE} ( ` +
    `  id INT, ` +
    `  line_number INT, ` +
    `  line_content VARCHAER(500), ` +
    `  file_id INT, ` +
    `  invoked_function_id INT ` +
    `)`;

  await executeCreateTableQuery(sql, INVOKER_FUNCTION_TABLE);
};

const executeInsertTableQuery = async (sql, queryParams, tableName) => {
  await postGreConnection
    .query(sql, queryParams)
    .then((res) => {
      console.log(
        `Insert into ${tableName} with [id: ${parmas[0]}] successfully`
      );
    })
    .catch((err) => {
      console.log(`Insert into ${tableName} with [id: ${parmas[0]}] failed!!!`);
      console.log(err);
    });
};

const insertSourceFileTable = async ({ id, folderPath, fileName }) => {
  const sql = `INSERT INTO ${SOURCE_FILE_TABLE} VALUES($1, $2, $3)`;
  const params = [id, folderPath, fileName];

  await executeInsertTableQuery(sql, params, SOURCE_FILE_TABLE);
};

const insertSourceClassTable = async ({ id, className, fileId, parentId }) => {
  const sql = `INSERT INTO ${CLASS_FILE_TABLE} VALUES($1, $2, $3, $4)`;
  const params = [id, className, fileId, parentId];

  await executeInsertTableQuery(sql, params, CLASS_FILE_TABLE);
};

const insertSourceFunctionTable = async ({ id, signature, name, fileId }) => {
  const sql = `INSERT INTO ${SOURCE_FUNCTION_TABLE} VALUES($1, $2, $3, $4)`;
  const params = [id, signature, name, fileId];

  await executeInsertTableQuery(sql, params, SOURCE_FUNCTION_TABLE);
};

const insertInvokerFunctionTable = async ({
  id,
  lineNumber,
  lineContent,
  fileId,
  invokedFunctionId,
}) => {
  const sql = `INSERT INTO ${INVOKER_FUNCTION_TABLE} VALUES($1, $2, $3, $4, $5)`;
  const params = [id, lineNumber, lineContent, fileId, invokedFunctionId];

  await executeInsertTableQuery(sql, params, INVOKER_FUNCTION_TABLE);
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

const getAllSourceFiles = async () => {
  const sql = `SELECT * FROM ${SOURCE_FILE_TABLE}`;

  return await postGreConnection
    .query(sql)
    .then((res) => {
      return res.rows.map((row) => {
        return {
          id: row.id,
          folderPath: row.folder_path,
          fileName: row.file_name,
        };
      });
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
    .then((res) => {
      return {
        id: res.rows[0].id,
        folderPath: res.rows[0].folder_path,
        fileName: res.rows[0].file_name,
      };
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
    `SELECT * FROM ${SOURCE_FILE_TABLE} ` +
    `WHERE folder_path = $1 AND file_name = $2`;
  const params = [folderPath, fileName];

  return await postGreConnection
    .query(sql, params)
    .then((res) => {
      return {
        id: res.rows[0].id,
        folderPath: res.rows[0].folder_path,
        fileName: res.rows[0].file_name,
      };
    })
    .catch((err) => {
      console.log(err);
      return;
    });
};

const getSourceFileByFilePath = async (filePath) => {
  const sql =
    `SELECT * FROM ${SOURCE_FILE_TABLE} ` +
    `WHERE (folder_path || '\\\\' || file_name) = $1`;
  const params = [filePath];

  return await postGreConnection
    .query(sql, params)
    .then((res) => {
      return {
        id: res.rows[0].id,
        folderPath: res.rows[0].folder_path,
        fileName: res.rows[0].file_name,
      };
    })
    .catch((err) => {
      console.log(err);
      return;
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

const getChildSourceClassesByClassId = async (classId) => {
  const sql = `SELECT * FROM ${SOURCE_CLASS_TABLE} WHERE parent_id = $1`;
  const params = [classId];

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

const getSourceFunctionsByFileId = async (fileId) => {
  const sql = `SELECT * FROM ${SOURCE_FUNCTION_TABLE} WHERE file_id = $1`;
  const params = [fileId];

  return await postGreConnection
    .query(sql, params)
    .then((res) => {
      return res.rows.map((row) => {
        return {
          id: row.id,
          signature: row.signature,
          name: row.name,
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
  createInvokerFunctionTable,
  insertSourceFileTable,
  insertSourceClassTable,
  insertSourceFunctionTable,
  insertInvokerFunctionTable,
  deleteAllRecordsInTable,
  getAllSourceFiles,
  getSourceFileByFileId,
  getSourceFileByFolderPathAndFileName,
  getSourceFileByFilePath,
  getSourceClassesByFileId,
  getChildSourceClassesByClassId,
  getSourceFunctionsByFileId,
};
