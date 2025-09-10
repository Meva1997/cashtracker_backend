import { createRequest, createResponse } from "node-mocks-http";
import { hasAccess, validateBudgetExists } from "../../../middleware/budget";
import Budget from "../../../models/Budget";
import { budgets } from "../../mocks/budget";

jest.mock("../../../models/Budget", () => ({
  findByPk: jest.fn(),
}));

describe("budget - validateBudgetExists", () => {
  it(" should handle non-existent budget", async () => {
    (Budget.findByPk as jest.Mock).mockResolvedValue(null); // Mock findByPk to return null
    const req = createRequest({
      params: { budgetId: 1 }, // Assuming 999 does not exist
    });

    const res = createResponse();
    const next = jest.fn();

    await validateBudgetExists(req, res, next);

    expect(res.statusCode).toBe(404);
    const data = res._getJSONData();
    expect(data).toEqual({ error: "Budget not found" });
    expect(next).not.toHaveBeenCalled(); // Ensure next was not called
  });

  it(" should handle existing budget", async () => {
    (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0]); // Mock findByPk to return a budget
    const req = createRequest({
      params: { budgetId: 1 },
    });

    const res = createResponse();
    const next = jest.fn();

    await validateBudgetExists(req, res, next);

    expect(next).toHaveBeenCalled(); // Ensure next was called
    expect(req.budget).toEqual(budgets[0]); // Ensure the budget is attached to the request object
  });

  it(" should handle server error", async () => {
    (Budget.findByPk as jest.Mock).mockRejectedValue(new Error()); // Mock findByPk to throw an error

    const req = createRequest({
      params: { budgetId: 1 },
    });

    const res = createResponse();
    const next = jest.fn();

    await validateBudgetExists(req, res, next);

    expect(res.statusCode).toBe(500);
    const data = res._getJSONData();
    expect(data).toEqual({ error: "Server Error" });
    expect(next).not.toHaveBeenCalled(); // Ensure next was not called
  });
});

describe("budget - hasAccess", () => {
  it(" should call next if user owns the budget", async () => {
    (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0]); // Mock findByPk to return a budget
    const req = createRequest({
      budget: budgets[0],
      user: { id: 1 }, // Mock authenticated user with id 1
    });

    const res = createResponse();
    const next = jest.fn();

    // First, validate that the budget exists and is attached to req
    await hasAccess(req, res, next);
    expect(next).toHaveBeenCalled(); // Ensure next was called
  });
  it(" should return 401 if user does not own the budget", async () => {
    const req = createRequest({
      budget: budgets[0],
      user: { id: 2 }, // Mock authenticated user with id 2 (different from budget's userId)
    });

    const res = createResponse();
    const next = jest.fn();

    // First, validate that the budget exists and is attached to req
    await hasAccess(req, res, next);
    expect(res.statusCode).toBe(401);
    const data = res._getJSONData();
    expect(data).toEqual({ error: "Access denied" });
    expect(next).not.toHaveBeenCalled(); // Ensure next was not called
  });
});
