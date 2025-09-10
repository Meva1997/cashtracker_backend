import { createRequest, createResponse } from "node-mocks-http";
import { budgets } from "../../mocks/budget";
import { BudgetController } from "../../../controllers/BudgetController";
import Budget from "../../../models/Budget";
import Expense from "../../../models/Expense";

jest.mock("../../../models/Budget", () => ({
  // Mock the Budget model
  findAll: jest.fn(), // Mock the findAll method
  create: jest.fn(), // Mock the create method
  findByPk: jest.fn(), // Mock the findByPk method
}));

describe("budgetController.getAll", () => {
  beforeEach(() => {
    (Budget.findAll as jest.Mock).mockReset();
    (Budget.findAll as jest.Mock).mockImplementation((options) => {
      const updatedBudgets = budgets.filter(
        (b) => b.userId === options.where.userId
      );
      return Promise.resolve(updatedBudgets);
    });
  });

  it("should retrieve 2 budgets for user with ID 1", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets",
      user: { id: 1 },
    });
    const res = createResponse();

    await BudgetController.getAll(req, res);

    const data = res._getJSONData();

    expect(data).toHaveLength(2);
    expect(res.statusCode).toBe(200);
    expect(res.statusCode).not.toBe(404);
  });

  it("Should retgrieve 1 budget for user with ID 2", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets",
      user: { id: 2 },
    });
    const res = createResponse();

    await BudgetController.getAll(req, res);

    const data = res._getJSONData();

    expect(data).toHaveLength(1);
    expect(res.statusCode).toBe(200);
    expect(res.statusCode).not.toBe(404);
  });
  it("should retrieve 0 budgets if user with id doesnt exist", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets",
      user: { id: 10 },
    });
    const res = createResponse();
    await BudgetController.getAll(req, res);

    const data = res._getJSONData();

    expect(data).toHaveLength(0);
    expect(res.statusCode).toBe(200);
    expect(res.statusCode).not.toBe(404);
  });

  it("should handle errors and return 500 status code", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets",
      user: { id: 10 },
    });
    const res = createResponse();
    (Budget.findAll as jest.Mock).mockRejectedValue(new Error());
    await BudgetController.getAll(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toStrictEqual({
      message: "Server Error",
    });
  });
});

describe("BudgetController.create", () => {
  it("should create a new budget and return it with status 201", async () => {
    const mockBudget = {
      save: jest.fn().mockResolvedValue(true), // Mock the save method
    };
    (Budget.create as jest.Mock).mockResolvedValue(mockBudget); // Mock the create method to return the mockBudget
    const req = createRequest({
      method: "POST",
      url: "/api/budgets",
      user: { id: 1 },
      body: {
        name: "New Budget",
        amount: 500,
      },
    });
    const res = createResponse();

    await BudgetController.create(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(data).toBe("Budget created successfully");
    expect(mockBudget.save).toHaveBeenCalled();
    expect(mockBudget.save).toHaveBeenCalledTimes(1);
    expect(Budget.create).toHaveBeenCalledWith(req.body);
  });
  it("should handle errors and return 500 status code", async () => {
    const mockBudget = {
      save: jest.fn(), // Mock the save method
    };
    const req = createRequest({
      method: "POST",
      url: "/api/budgets",
      user: { id: 10 },
    });
    const res = createResponse();
    (Budget.create as jest.Mock).mockRejectedValue(new Error());
    await BudgetController.create(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toStrictEqual({
      message: "Server Error",
    });
    expect(mockBudget.save).not.toHaveBeenCalled();
  });
});

describe("BudgetController.getById", () => {
  beforeEach(() => {
    (Budget.findByPk as jest.Mock).mockReset(); // Reset the mock before each test if not it will keep the previous implementation and fail the tests because it will accumulate all the save calls
    (Budget.findByPk as jest.Mock).mockImplementation((id, include) => {
      // Add your mock implementation logic here
      const budget = budgets.filter((b) => b.id === id)[0];
      return Promise.resolve(budget); //since it is async function it returns a promise
    });
  });
  it("should return the budget with the given ID and 3 expenses", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets/:id",
      budget: { id: 1 },
    });
    const res = createResponse();

    await BudgetController.getById(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.expenses).toHaveLength(3);
    expect(Budget.findByPk).toHaveBeenCalled();
    expect(Budget.findByPk).toHaveBeenCalledTimes(1);
    expect(Budget.findByPk).toHaveBeenCalledWith(req.budget.id, {
      include: [Expense],
    });
  });
  it("should return the budget with the given ID and 2 expenses", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets/:id",
      budget: { id: 2 },
    });
    const res = createResponse();

    await BudgetController.getById(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.expenses).toHaveLength(2);
    expect(Budget.findByPk).toHaveBeenCalledTimes(1);
  });
  it("should return the budget with the given ID and 0 expenses", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets/:id",
      budget: { id: 3 },
    });
    const res = createResponse();

    await BudgetController.getById(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.expenses).toHaveLength(0);
    expect(Budget.findByPk).toHaveBeenCalledTimes(1);
  });
});

describe("BudgetController.updateById", () => {
  it("should update the budget and return a success message", async () => {
    const mockBudget = {
      update: jest.fn().mockResolvedValue(true), // Mock the update method
    };
    const req = createRequest({
      method: "PUT",
      url: "/api/budgets/:id",
      budget: mockBudget, // Mock the budget object in the request
      body: {
        name: "Updated Budget",
        amount: 800,
      },
    });
    const res = createResponse();
    await BudgetController.updateById(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toStrictEqual("Budget updated successfully");
    expect(mockBudget.update).toHaveBeenCalled();
    expect(mockBudget.update).toHaveBeenCalledTimes(1);
    expect(mockBudget.update).toHaveBeenCalledWith(req.body);
  });
});

describe("BudgetController.deleteById", () => {
  it("should delete the budget and return a success message", async () => {
    const mockBudget = {
      destroy: jest.fn().mockResolvedValue(true), // Mock the destroy method
    };
    const req = createRequest({
      method: "DELETE",
      url: "/api/budgets/:id",
      budget: mockBudget,
    });
    const res = createResponse();
    await BudgetController.deleteById(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toStrictEqual("Budget deleted successfully");
    expect(mockBudget.destroy).toHaveBeenCalled();
    expect(mockBudget.destroy).toHaveBeenCalledTimes(1);
  });
});
