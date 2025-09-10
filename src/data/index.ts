import { exit } from "node:process";
import { db } from "../config/db";

const clearData = async () => {
  try {
    await db.sync({ force: true });
    console.log("All data cleared from the database.");
    exit(0);
  } catch (error) {
    //console.error("Error clearing data:", error);
    exit(1);
  }
};

if (process.argv[2] === "--clear") {
  clearData();
}
