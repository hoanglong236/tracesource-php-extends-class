const { initSourceFileTable } = require('./init-source-file-table');
const { initSourceClassTable } = require('./init-source-class-table');
const { initSourceFunctionTable } = require('./init-source-function-table');
const { initFunctionInvokerTable } = require('./init-function-invoker-table');
const {
  createSourceFileTable,
  createSourceClassTable,
  createSourceFunctionTable,
  createFunctionInvokerTable,
  deleteAllRecordsInTable,
} = require('./dao');
const {
  SOURCE_FILE_TABLE,
  SOURCE_CLASS_TABLE,
  SOURCE_FUNCTION_TABLE,
  FUNCTION_INVOKER_TABLE,
} = require('./data');

const main = async () => {
  await createSourceFileTable();
  await deleteAllRecordsInTable(SOURCE_FILE_TABLE);
  await initSourceFileTable();

  await createSourceClassTable();
  await deleteAllRecordsInTable(SOURCE_CLASS_TABLE);
  await initSourceClassTable();

  await createSourceFunctionTable();
  await deleteAllRecordsInTable(SOURCE_FUNCTION_TABLE);
  await initSourceFunctionTable();

  await createFunctionInvokerTable();
  await deleteAllRecordsInTable(FUNCTION_INVOKER_TABLE);
  await initFunctionInvokerTable();
};

main();
