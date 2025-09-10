import { Request, Response, NextFunction } from "express";
import { param, validationResult, body } from "express-validator";
import Budget from "../models/Budget";

declare global {
  // Extend the Express Request interface to include the budget property
  namespace Express {
    interface Request {
      budget?: Budget; // Add the budget property to the Request interface
    }
  }
}

export const validateBudgetId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await param("budgetId")
    .isInt()
    .withMessage("Invalid ID")
    .bail() // Stop running validations if any of the previous ones have failed
    .custom((value) => value > 0) // Custom validator to check if ID is greater than zero
    .withMessage("Invalid ID")
    .bail()
    .run(req); // Run the validation on the request object
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
export const validateBudgetExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { budgetId } = req.params;
    const budget = await Budget.findByPk(budgetId); // Find budget by primary key (ID)
    if (!budget) {
      const error = new Error("Budget not found");
      return res.status(404).json({ error: error.message }); // If budget not found, send 404 response
    }
    req.budget = budget; // Attach the found budget to the request object for further use
    next();
  } catch (error) {
    //console.log(error);
    res.status(500).json({ error: "Server Error" });
  }
};

export const validateBudgetInput = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("name").notEmpty().withMessage("Budget name is required").run(req); // Validate that name is not empty
  await body("amount")
    .notEmpty()
    .withMessage("Amount is required ")
    .isNumeric()
    .withMessage("Amount must be a number")
    .custom((value) => value > 0) // Custom validator to check if amount is greater than zero
    .withMessage("Amount must be greater than zero")
    .run(req); // Validate that amount is a number and greater than zero
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const hasAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.budget.userId !== req.user.id) {
    //If the budget's userId does not match the authenticated user's ID
    const error = new Error("Access denied");
    return res.status(401).json({ error: error.message }); // If budget not found, send 404 response
  }
  next();
};
