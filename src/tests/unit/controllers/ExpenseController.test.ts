import { createRequest, createResponse } from "node-mocks-http";
import Expense from "../../../models/Expense";
import { ExpensesController } from "../../../controllers/ExpenseController";
import { expenses } from "../../mocks/expenses";

jest.mock("../../../models/Expense", () => ({
  create: jest.fn(),
}));

describe("ExpensesController.create", () => {
  it("should create an expense and return 201 status", async () => {
    const expenseMock = {
      save: jest.fn().mockResolvedValue(true),
    };
    (Expense.create as jest.Mock).mockResolvedValue(expenseMock);

    const req = createRequest({
      method: "POST",
      url: "/api/budgets/:budgetId/expenses",
      body: { name: "test name", amount: 100 },
      budget: { id: 1 }, // Mock budget attached to request
    });

    const res = createResponse();

    await ExpensesController.create(req, res);

    expect(res.statusCode).toBe(201);
    const data = res._getJSONData();
    expect(data).toBe("Expense created");
    expect(Expense.create).toHaveBeenCalledWith(req.body); // Ensure create method was called with req.body
    expect(expenseMock.save).toHaveBeenCalled(); // Ensure save method was called
    expect(expenseMock.save).toHaveBeenCalledTimes(1); // Ensure save method was called
  });
  it("should handle expense creation error", async () => {
    const expenseMock = {
      save: jest.fn(),
    };
    (Expense.create as jest.Mock).mockRejectedValue(new Error());

    const req = createRequest({
      method: "POST",
      url: "/api/budgets/:budgetId/expenses",
      body: { name: "test name", amount: 100 },
      budget: { id: 1 }, // Mock budget attached to request
    });

    const res = createResponse();

    await ExpensesController.create(req, res);

    expect(res.statusCode).toBe(500);
    const data = res._getJSONData();
    expect(data).toStrictEqual({ error: "Server Error" });
    expect(Expense.create).toHaveBeenCalledWith(req.body); // Ensure create method was called with req.body
    expect(expenseMock.save).not.toHaveBeenCalled(); // Ensure save method was calledç
  });
});

describe("ExpensesController.getById", () => {
  it("should return expense with id 1", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: expenses[0], // Mock expense attached to request imported from mocks
    });

    const res = createResponse();

    await ExpensesController.getById(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data).toEqual(expenses[0]);
  });
});
describe("ExpensesController.updateById", () => {
  it("should handle expense update", async () => {
    const expenseMock = {
      ...expenses[0],
      update: jest.fn().mockResolvedValue(true),
    };
    const req = createRequest({
      method: "GET",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: expenseMock, // Mock expense attached to request imported from mocks
      body: { name: "Updated Name", amount: 500 },
    });

    const res = createResponse();

    await ExpensesController.updateById(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data).toEqual("Expense updated");
    expect(expenseMock.update).toHaveBeenCalledWith(req.body);
    expect(expenseMock.update).toHaveBeenCalledTimes(1);
  });
});
describe("ExpensesController.deleteById", () => {
  it("should delete an expense by id and return a succes message", async () => {
    const expenseMock = {
      ...expenses[0],
      destroy: jest.fn().mockResolvedValue(true),
    };
    const req = createRequest({
      method: "DELETE",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: expenseMock, // Mock expense attached to request imported from mocks
    });

    const res = createResponse();

    await ExpensesController.deleteById(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data).toBe("Expense deleted");
    expect(expenseMock.destroy).toHaveBeenCalled();
    expect(expenseMock.destroy).toHaveBeenCalledTimes(1);
  });
});
