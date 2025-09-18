import { hasAccess } from "./budget";
import type { Request, Response, NextFunction } from "express";
import { param, body, validationResult } from "express-validator";
import Expense from "../models/Expense";

declare global {
  namespace Express {
    interface Request {
      expense?: Expense; // Add the expense property to the Request interface
    }
  }
}

export const validateExpenseInput = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("name")
    .notEmpty()
    .withMessage("Expense name is required")
    .run(req); // Validate that name is not empty
  await body("amount")
    .notEmpty()
    .withMessage("Amount is required ")
    .isNumeric()
    .withMessage("Amount must be a number")
    .custom((value) => value > 0) // Custom validator to check if amount is greater than zero
    .withMessage("Amount must be greater than zero")
    .run(req); // Run the validation on the request object

  next();
};

export const validateExpenseId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await param("expenseId")
    .isInt()
    .withMessage("Invalid ID")
    .custom((value) => value > 0) // Custom validator to check if ID is greater than zero
    .withMessage("Invalid ID")
    .run(req); // Run the validation on the request object

  next();
};

export const validateExpenseExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { expenseId } = req.params;
    const expense = await Expense.findByPk(expenseId);
    if (!expense) {
      const error = new Error("Expense not found");
      return res.status(404).json({ error: error.message });
    }
    req.expense = expense; // Attach the found expense to the request object for further use
    next();
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

export const belongsToBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.budget.id !== req.expense.budgetId) {
    const error = new Error("Invalid Action");
    return res.status(403).json({ error: error.message });
  }

  next();
};
