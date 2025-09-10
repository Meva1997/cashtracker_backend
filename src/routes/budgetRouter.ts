import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";
import {
  hasAccess,
  validateBudgetExists,
  validateBudgetId,
  validateBudgetInput,
} from "../middleware/budget";
import { ExpensesController } from "../controllers/ExpenseController";
import {
  validateExpenseExists,
  validateExpenseId,
  validateExpenseInput,
} from "../middleware/expense";
import { handleInputErrors } from "../middleware/validations";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate); // Apply authentication middleware to all routes in this router

router.param("budgetId", validateBudgetId); // Middleware to validate budget ID, this means that every route with :id will first run this middleware
router.param("budgetId", validateBudgetExists); // Middleware to check if budget exists, this means that every route with :id will first run this middleware
router.param("budgetId", hasAccess); // Middleware to check if the authenticated user has access to the budget and remember to add this after validateBudgetExists and after authenticate

router.param("expenseId", validateExpenseId); // Middleware to validate expense ID, this means that every route with :expenseId will first run this middleware
router.param("expenseId", validateExpenseExists); // Middleware to check if expense exists, this means that every route with :expenseId will first run this middleware

// Define your budget-related routes here
router.get("/", BudgetController.getAll); // Example route to get all budgets
router.post("/", validateBudgetInput, BudgetController.create); // Example route to get all budgets
router.get("/:budgetId", BudgetController.getById); // Example route to get all budgets
router.put("/:budgetId", validateBudgetInput, BudgetController.updateById); //Edit budget by id
router.delete("/:budgetId", BudgetController.deleteById); // Example route to get all budgets

//! Routes for Expenses
router.post(
  "/:budgetId/expenses",
  validateExpenseInput,
  handleInputErrors,
  ExpensesController.create
); // Create a new expense for a specific budget
router.get(
  "/:budgetId/expenses/:expenseId",
  handleInputErrors,
  ExpensesController.getById
); // Get a specific expense by ID for a specific budget
router.put(
  "/:budgetId/expenses/:expenseId",
  validateExpenseInput,
  handleInputErrors,
  ExpensesController.updateById
); // Update a specific expense by ID for a specific budget
router.delete("/:budgetId/expenses/:expenseId", ExpensesController.deleteById); // Delete

export default router;
