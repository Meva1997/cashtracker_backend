import { Request, Response } from "express";
import User from "../models/User";
import { verifyPassword, hashPassword } from "./../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Check if user with the same email already exists
    const userExists = await User.findOne({
      where: { email },
    });

    if (userExists) {
      const error = new Error("A user with this email already exists");
      return res.status(409).json({ error: error.message });
    }
    try {
      const user = await User.create(req.body);
      user.password = await hashPassword(password);
      const token = generateToken();
      user.token = token; // Save the generated token to the user

      if (process.env.NODE_ENV !== "production") {
        globalThis.cashTrackerConfirmationToken = token;
      }

      await user.save();
      await AuthEmail.sendConfirmationEmail({
        name: user.name,
        email: user.email,
        token: user.token,
      });
      res.status(201).json("User created successfully");
    } catch (error) {
      //console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const user = await User.findOne({ where: { token } });

      if (!user) {
        const error = new Error("Invalid token");
        return res.status(401).json({ error: error.message });
      }
      user.confirmed = true;
      user.token = null; // Clear the token after confirmation
      await user.save();
      res.json("Account confirmed successfully");
    } catch (error) {
      //console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const userExists = await User.findOne({ where: { email } });

      if (!userExists) {
        const error = new Error("User does not exist");
        return res.status(404).json({ error: error.message });
      }

      if (!userExists.confirmed) {
        const error = new Error("Account not confirmed");
        return res.status(403).json({ error: error.message });
      }

      const isValidPassword = await verifyPassword(
        password,
        userExists.password
      );

      if (!isValidPassword) {
        const error = new Error("Incorrect password");
        return res.status(401).json({ error: error.message });
      }

      const token = generateJWT(userExists.id);

      res.json(token);
    } catch (error) {
      //console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });

      if (!user) {
        const error = new Error("User does not exist");
        return res.status(404).json({ error: error.message });
      }

      user.token = generateToken();
      await user.save();
      await AuthEmail.sendPasswordResetToken({
        name: user.name,
        email: user.email,
        token: user.token,
      });

      res.json("We have sent you an email with instructions");
    } catch (error) {
      //console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await User.findOne({ where: { token } });

      if (!tokenExists) {
        const error = new Error("Invalid token");
        return res.status(404).json({ error: error.message });
      }

      res.json("Token is valid, proceed to reset password");
    } catch (error) {
      //console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  static resetPasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findOne({ where: { token } });

      if (!user) {
        const error = new Error("Invalid token");
        return res.status(404).json({ error: error.message });
      }

      user.password = await hashPassword(password);
      user.token = null; // Clear the token after resetting the password
      await user.save();

      res.json("Password updated successfully");
    } catch (error) {
      //console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  static user = async (req: Request, res: Response) => {
    res.json(req.user);
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    try {
      const { current_password, password } = req.body;
      const { id } = req.user;
      const user = await User.findByPk(id);

      const isPasswordCorrect = await verifyPassword(
        current_password,
        user.password
      );
      if (!isPasswordCorrect) {
        const error = new Error("Current password is incorrect");
        return res.status(401).json({ message: error.message });
      }
      user.password = await hashPassword(password);
      await user.save();
      res.json("Password updated successfully");
    } catch (error) {
      //console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    try {
      const { password } = req.body;
      const { id } = req.user;
      const user = await User.findByPk(id);

      const isPasswordCorrect = await verifyPassword(password, user.password);
      if (!isPasswordCorrect) {
        const error = new Error("Current password is incorrect");
        return res.status(401).json({ message: error.message });
      }
      res.json("Password is correct");
    } catch (error) {
      //console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
