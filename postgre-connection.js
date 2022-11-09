const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const postGreConnection = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_SECRET,
  database: process.env.PG_DATABASE,
});

(async () => {
  await postGreConnection.connect();
})();

module.exports = {
  postGreConnection,
};
