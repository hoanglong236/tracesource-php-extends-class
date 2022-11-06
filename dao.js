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
    `  file_path VARCHAR(500), ` +
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
    `  function_name VARCHAR(150), ` +
    `  class_id INT` +
    `)`;

  await executeCreateTableQuery(sql, SOURCE_FUNCTION_TABLE);
};

const createInvokerFunctionTable = async () => {
  const sql =
    `CREATE TABLE ${INVOKER_FUNCTION_TABLE} ( ` +
    `  id INT, ` +
    `  line_number INT, ` +
    `  line_content VARCHAER(500), ` +
    `  class_id INT, ` +
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

const insertSourceFileTable = async ({ id, filePath, fileName }) => {
  const sql = `INSERT INTO ${SOURCE_FILE_TABLE} VALUES($1, $2, $3)`;
  const params = [id, filePath, fileName];

  await executeInsertTableQuery(sql, params, SOURCE_FILE_TABLE);
};

const insertSourceClassTable = async ({ id, className, fileId, parentId }) => {
  const sql = `INSERT INTO ${CLASS_FILE_TABLE} VALUES($1, $2, $3, $4)`;
  const params = [id, className, fileId, parentId];

  await executeInsertTableQuery(sql, params, CLASS_FILE_TABLE);
};

const insertSourceFunctionTable = async ({
  id,
  functionSignature,
  functionName,
  classId,
}) => {
  const sql = `INSERT INTO ${SOURCE_FUNCTION_TABLE} VALUES($1, $2, $3, $4)`;
  const params = [id, functionSignature, functionName, classId];

  await executeInsertTableQuery(sql, params, SOURCE_FUNCTION_TABLE);
};

const insertInvokerFunctionTable = async ({
  id,
  lineNumber,
  lineContent,
  classId,
  invokedFunctionId,
}) => {
  const sql = `INSERT INTO ${INVOKER_FUNCTION_TABLE} VALUES($1, $2, $3, $4, $5)`;
  const params = [
    id,
    lineNumber,
    lineContent,
    classId,
    invokedFunctionId,
  ];

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

const getSourceFileByFileId = async (fileId) => {
  const sql = `SELECT * FROM ${SOURCE_FILE_TABLE} WHERE id = $1`;
  const params = [fileId];

  return await postGreConnection
    .query(sql, params)
    .then((res) => {
      return {
        id: res.rows[0].id,
        filePath: res.rows[0].file_path,
        fileName: res.rows[0].file_name,
      };
    })
    .catch((err) => {
      console.log(err);
      return;
    });
};

const getSourceFileByFilePathAndFileName = async (filePath, fileName) => {
  const sql =
    `SELECT * FROM ${SOURCE_FILE_TABLE} ` +
    `WHERE filePath = $1 AND fileName = $2`;
  const params = [filePath, fileName];

  return await postGreConnection
    .query(sql, params)
    .then((res) => {
      return {
        id: res.rows[0].id,
        filePath: res.rows[0].file_path,
        fileName: res.rows[0].file_name,
      };
    })
    .catch((err) => {
      console.log(err);
      return;
    });
};

const getSourceFileByFullFilePath = async (fullFilePath) => {
  const sql =
    `SELECT * FROM ${SOURCE_FILE_TABLE} ` +
    `WHERE (filePath || '\\\\' || fileName) = $1`;
  const params = [fullFilePath];

  return await postGreConnection
    .query(sql, params)
    .then((res) => {
      return {
        id: res.rows[0].id,
        filePath: res.rows[0].file_path,
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
        }
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

const getSourceFunctionsByClassId = async (classId) => {
  const sql = `SELECT * FROM ${SOURCE_FUNCTION_TABLE} WHERE class_id = $1`;
  const params = [classId];

  return await postGreConnection
    .query(sql, params)
    .then((res) => {
      return res.rows.map((row) => {
        return {
          id: row.id,
          functionSignature: row.signature,
          functionName: row.function_name,
          classId: row.class_id,
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
  getSourceFileByFileId,
  getSourceFileByFilePathAndFileName,
  getSourceFileByFullFilePath,
  getSourceClassesByFileId,
  getChildSourceClassesByClassId,
  getSourceFunctionsByClassId,
};
