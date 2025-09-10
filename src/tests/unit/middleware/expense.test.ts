import { createRequest, createResponse } from "node-mocks-http";
import { validateExpenseExists } from "../../../middleware/expense";
import Expense from "../../../models/Expense";
import { expenses } from "../../mocks/expenses";
import { hasAccess } from "../../../middleware/budget";
import { budgets } from "../../mocks/budget";

jest.mock("../../../models/Expense", () => ({
  findByPk: jest.fn(),
}));

describe("Expenses middleware - validateExpenseExists", () => {
  beforeEach(() => {
    (Expense.findByPk as jest.Mock).mockImplementation((id) => {
      const expense = expenses.filter((exp) => exp.id === id)[0] ?? null;
      return Promise.resolve(expense);
    });
  });
  it(" should handle non-existent expense", async () => {
    const req = createRequest({
      params: { expenseId: 999 }, // Assuming 999 does not exist
    });

    const res = createResponse();
    const next = jest.fn();

    await validateExpenseExists(req, res, next);

    expect(res.statusCode).toBe(404);
    const data = res._getJSONData();
    expect(data).toEqual({ message: "Expense not found" });
    expect(next).not.toHaveBeenCalled(); // Ensure next was not called
  });
  it(" should handle existing expense", async () => {
    const req = createRequest({
      params: { expenseId: 1 },
    });

    const res = createResponse();
    const next = jest.fn();

    await validateExpenseExists(req, res, next);

    expect(next).toHaveBeenCalled(); // Ensure next was called
    expect(req.expense).toEqual(expenses[0]); // Ensure the expense is attached to the request object
  });
  it(" should handle server error", async () => {
    (Expense.findByPk as jest.Mock).mockRejectedValue(new Error()); // Mock findByPk to throw an error

    const req = createRequest({
      params: { expenseId: 1 },
    });

    const res = createResponse();
    const next = jest.fn();

    await validateExpenseExists(req, res, next);

    expect(res.statusCode).toBe(500);
    const data = res._getJSONData();
    expect(data).toEqual({ error: "Server Error" });
    expect(next).not.toHaveBeenCalled(); // Ensure next was not called
  });
  it("should prevent unauthorized users from adding expenses", async () => {
    const req = createRequest({
      method: "POST",
      url: "/api/budgets/:budgetId/expenses",
      budget: budgets[0], // Mock budget attached to request
      user: { id: 20 }, // Mock authenticated user with id different from budget's userId
      body: { name: "New Expense", amount: 100 }, // Mock request body
    });
    const res = createResponse();
    const next = jest.fn();

    hasAccess(req, res, next);

    expect(res.statusCode).toBe(401);
    const data = res._getJSONData();
    expect(data).toEqual({ error: "Access denied" });
    expect(next).not.toHaveBeenCalled(); // Ensure next was not called
  });
});
