const {Sequelize} = require("sequelize-typescript");

const HOST = process.env.HOST;

const db = new Sequelize({
  host: HOST,
  port: 5432,
  dialect: "postgres",
  username: "postgres",
  database: "whspr",
  password: "ok",
  logging: false //disables sql commands being logged in console
});

db.authenticate().then(() => {
  console.log(`successfully connected to the database on ${HOST}`);
}).catch((error: any) => {
  console.error("error connecting to the database: ", error.message);
});

(async () => {
    try {
      await db.sync({ force: false });
      console.log("Database synced!");
    } catch (error) {
      console.log("Error syncing database!", error);
    }
  })();

module.exports = db