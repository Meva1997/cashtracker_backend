import type { Request, Response } from "express";
import Budget from "../models/Budget";
import Expense from "../models/Expense";

export class BudgetController {
  // BudgetController class
  // Controller methods will be defined here
  static getAll = async (req: Request, res: Response) => {
    // Method to get all budgets
    // Logic to fetch all budgets from the database
    try {
      const budgets = await Budget.findAll({
        order: [["createdAt", "DESC"]], // Order by creation date descending
        limit: 10,
        where: {
          // Add any filtering conditions here if needed
          // For example, you can filter by a specific user ID if budgets are user-specific
          userId: req.user.id, // Assuming req.user is set by authentication middleware
        },
      }); // Fetch all budgets from the database
      res.json(budgets); // Send the fetched budgets as JSON response
    } catch (error) {
      //console.log(error);
      res.status(500).json({ message: "Server Error" });
    }
  };

  static create = async (req: Request, res: Response) => {
    // Logic to fetch all budgets from the database
    try {
      const budget = await Budget.create(req.body); // Create a new Budget instance with request body data
      budget.userId = req.user.id; // Assign the user ID from the authenticated user (assuming req.user is set by authentication middleware)
      await budget.save(); // Save the new budget to the database
      res.status(201).json("Budget created successfully"); // Send success response
    } catch (error) {
      // console.log(error);
      res.status(500).json({ message: "Server Error" });
    }
  };

  static getById = async (req: Request, res: Response) => {
    const budget = await Budget.findByPk(req.budget.id, {
      include: [Expense], // Include associated expenses
    }); // Find the budget by primary key (ID)

    res.json(budget); // Send the found budget as JSON response
  };

  static updateById = async (req: Request, res: Response) => {
    await req.budget.update(req.body); // Save the updated budget to the database
    res.json("Budget updated successfully"); // Send success response
  };

  static deleteById = async (req: Request, res: Response) => {
    await req.budget.destroy(); // Delete the budget from the database
    res.json("Budget deleted successfully"); // Send success response
  };
}
