import type { Request, Response } from "express";
import Expense from "../models/Expense";

export class ExpensesController {
  static create = async (req: Request, res: Response) => {
    try {
      const expense = await Expense.create(req.body);
      expense.budgetId = req.budget.id; // Assign the budgetId from the request's budget property
      await expense.save();
      res.status(201).json("Expense created");
    } catch (error) {
      //console.log("Error creating expense:", error);
      res.status(500).json({ error: "Server Error" });
    }
  };

  static getById = async (req: Request, res: Response) => {
    res.json(req.expense);
  };

  static updateById = async (req: Request, res: Response) => {
    await req.expense.update(req.body);
    res.json("Expense updated");
  };

  static deleteById = async (req: Request, res: Response) => {
    await req.expense.destroy();
    res.json("Expense deleted");
  };
}
