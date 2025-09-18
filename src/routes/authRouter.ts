import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validations";
import { limiter } from "../config/limiter";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(limiter); //? Apply rate limiting to all routes in this router

router.post(
  "/create-account",
  body("name").notEmpty().withMessage("Name is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("email").isEmail().withMessage("Invalid email address"),
  handleInputErrors,
  AuthController.createAccount
);

router.post(
  "/confirm-account",
  //limiter, //? Apply rate limiting to this specific route
  body("token")
    .isLength({ min: 6, max: 6 })
    .withMessage("Invalid token format"),
  handleInputErrors,
  AuthController.confirmAccount
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  handleInputErrors,
  AuthController.login
);

router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Invalid email address"),
  handleInputErrors,
  AuthController.forgotPassword
);

router.post(
  "/validate-token",
  body("token")
    .notEmpty()
    .withMessage("Token is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Token must be 6 characters long"),
  handleInputErrors,
  AuthController.validateToken
);

router.post(
  "/reset-password/:token",
  param("token")
    .notEmpty()
    .withMessage("Token is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Token must be 6 characters long"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  handleInputErrors,
  AuthController.resetPasswordWithToken
);

router.get("/user", authenticate, AuthController.user);

router.post(
  "/update-password",
  authenticate,
  body("current_password")
    .notEmpty()
    .withMessage("Current password is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long"),
  handleInputErrors,
  AuthController.updateCurrentUserPassword
);
router.post(
  "/check-password",
  authenticate,
  body("password").notEmpty().withMessage("Current password is required"),
  handleInputErrors,
  AuthController.checkPassword
);
router.put(
  "/update-profile",
  authenticate,
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email address"),
  handleInputErrors,
  AuthController.updateProfile
);

export default router;
