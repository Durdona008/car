require("dotenv").config();

console.log("ISHLADI");

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {

    console.log("DB ulanish boshlanmoqda...");

    await connectDB();

    console.log("MongoDB ulandi");

    app.listen(PORT, () => {
      console.log(`Server ${PORT} portda ishga tushdi`);
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
  }
};

start();