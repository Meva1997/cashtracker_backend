import express from "express";
import colors from "colors";
import morgan from "morgan";
import { db } from "./config/db";
import budgetRouter from "./routes/budgetRouter";
import authRouter from "./routes/authRouter";

// Connect to database
export async function connectDB() {
  try {
    await db.authenticate();
    db.sync();
    //console.log(colors.blue.bold("DB connected"));
  } catch (error) {
    //console.log(error);
    //console.log(colors.red.bold("DB Connection Error"));
  }
}

connectDB();

const app = express();

app.use(morgan("dev"));

app.use(express.json());

app.use("/api/budgets", budgetRouter); // Use budgetRouter for /api/budgets routes
app.use("/api/auth", authRouter); // Use budgetRouter for /api/budgets routes

export default app;
