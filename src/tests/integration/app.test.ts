import { id } from "./../../../node_modules/ci-info/index.d";
import request from "supertest";
import server from "../../server";
import { AuthController } from "../../controllers/AuthController";
import User from "../../models/User";
import * as authUtils from "../../utils/auth";
import * as jwtUtils from "../../utils/jwt";

describe("Aurhentication - Create Account", () => {
  it("should display validation errors for missing fields", async () => {
    const response = await request(server)
      .post("/api/auth/create-account")
      .send({});

    const createMock = jest.spyOn(AuthController, "createAccount");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(3);
    expect(response.status).not.toBe(200);
    expect(createMock).not.toHaveBeenCalled();
  });
  it("should return status code 400 when the email is invalid", async () => {
    const response = await request(server)
      .post("/api/auth/create-account")
      .send({
        name: "John Doe",
        email: "invalid-email",
        password: "password123",
      });

    const createAccountMock = jest.spyOn(AuthController, "createAccount");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.status).not.toBe(201);
    expect(response.body.errors).not.toHaveLength(2);
    expect(createAccountMock).not.toHaveBeenCalled();
    expect(response.body.errors[0].msg).toBe("Invalid email address");
  });
  it("should return status code 400 when the password is short", async () => {
    const response = await request(server)
      .post("/api/auth/create-account")
      .send({
        name: "John Doe",
        email: "email@email.com",
        password: "123",
      });

    const createAccountMock = jest.spyOn(AuthController, "createAccount");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.status).not.toBe(201);
    expect(response.body.errors).not.toHaveLength(2);
    expect(createAccountMock).not.toHaveBeenCalled();
    expect(response.body.errors[0].msg).toBe(
      "Password must be at least 8 characters long"
    );
  });
  it("should create a new user account successfully", async () => {
    const response = await request(server)
      .post("/api/auth/create-account")
      .send({
        name: "John Doe",
        email: "email2@email.com",
        password: "password123",
      });

    expect(response.status).toBe(201);

    expect(response.status).not.toBe(400);
    expect(response.body).not.toHaveProperty("errors");
  });
  it("should return status code 409 conflict when a user is already registered", async () => {
    const response = await request(server)
      .post("/api/auth/create-account")
      .send({
        name: "John Doe",
        email: "email2@email.com",
        password: "password123",
      });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("A user with this email already exists");
    expect(response.status).not.toBe(400);
    expect(response.status).not.toBe(201);
    expect(response.body).not.toHaveProperty("errors");
  });
});

describe("Authentication - Confirm Account", () => {
  it("should return error if token is empty or not valid ", async () => {
    const response = await request(server)
      .post("/api/auth/confirm-account")
      .send({ token: "" });

    const confirmAccountMock = jest.spyOn(AuthController, "confirmAccount");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("Invalid token format");

    expect(response.status).not.toBe(200);
    expect(confirmAccountMock).not.toHaveBeenCalled();
  });
  it("should return error if token does not exist in the database", async () => {
    const response = await request(server)
      .post("/api/auth/confirm-account")
      .send({ token: "111111" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Invalid token");
    expect(response.status).not.toBe(200);
  });
  it("should confirm the account successfully with a valid token", async () => {
    // First, create a new user to get a valid token
    const token = globalThis.cashTrackerConfirmationToken;
    const response = await request(server)
      .post("/api/auth/confirm-account")
      .send({ token });

    expect(response.status).toBe(200);
    expect(response.body).toBe("Account confirmed successfully");
    expect(response.status).not.toBe(400);
    expect(response.status).not.toBe(401);
  });
});

describe("Authentication - Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return validation errors for missing fields", async () => {
    const response = await request(server).post("/api/auth/login").send({});

    const loginMock = jest.spyOn(AuthController, "login");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(2);
    expect(response.status).not.toBe(200);
    expect(loginMock).not.toHaveBeenCalled();
  });
  it("should return error if email is invalid", async () => {
    const response = await request(server).post("/api/auth/login").send({
      email: "invalid-email",
      password: "password123",
    });

    const loginMock = jest.spyOn(AuthController, "login");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("Invalid email address");

    expect(response.status).not.toBe(200);
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("should return error if the user does not exist", async () => {
    const response = await request(server).post("/api/auth/login").send({
      email: "meva@email.com",
      password: "password123",
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("User does not exist");

    expect(response.status).not.toBe(200);
  });
  it("should return error if the account is not confirmed", async () => {
    // First, create a new user without confirming the account
    (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue({
      id: 1,
      confirmed: false,
      password: "hashedpassword",
      email: "notConfirmed@email.com",
    }); // Mock the user retrieval
    const response = await request(server).post("/api/auth/login").send({
      email: "notConfirmed@email.com",
      password: "hashedpassword",
    });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Account not confirmed");

    expect(response.status).not.toBe(200);
  });
  it("should return error if the password is incorrect", async () => {
    const findOne = (
      jest.spyOn(User, "findOne") as jest.Mock
    ).mockResolvedValue({
      id: 1,
      confirmed: true,
      password: "hashedPassword",
      email: "email2@email.com",
    }); // Mock the user retrieval

    const checkPassword = (
      jest.spyOn(authUtils, "verifyPassword") as jest.Mock
    ).mockResolvedValue(false); // Mock password verification to return false
    const response = await request(server).post("/api/auth/login").send({
      email: "email2@email.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Incorrect password");

    expect(response.status).not.toBe(200);

    expect(findOne).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenCalledTimes(1);
  });
  it("should generate a JWT token on successful login", async () => {
    const findOne = (
      jest.spyOn(User, "findOne") as jest.Mock
    ).mockResolvedValue({
      id: 5,
      confirmed: true,
      password: "hashedPassword",
      email: "email2@email.com",
    }); // Mock the user retrieval

    const checkPassword = (
      jest.spyOn(authUtils, "verifyPassword") as jest.Mock
    ).mockResolvedValue(true); // Mock password verification to return true

    const generateToken = (
      jest.spyOn(jwtUtils, "generateJWT") as jest.Mock
    ).mockReturnValue("jwt-token"); // Mock JWT generation

    const response = await request(server).post("/api/auth/login").send({
      email: "email2@email.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toBe("jwt-token");

    expect(findOne).toHaveBeenCalled();
    expect(findOne).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenCalled();
    expect(checkPassword).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenCalledWith("password123", "hashedPassword");
    expect(generateToken).toHaveBeenCalled();
    expect(generateToken).toHaveBeenCalledTimes(1);
    expect(generateToken).toHaveBeenCalledWith(5);
  });
});

let jwtToken: string;
async function authenticateUser() {
  const response = await request(server)
    .post("/api/auth/login")
    .send({ email: "email2@email.com", password: "password123" });

  jwtToken = response.body;
}

describe("GET /api/budgets", () => {
  beforeAll(() => {
    jest.restoreAllMocks(); // Restore original implementations of all mocks
  });
  beforeAll(async () => {
    await authenticateUser();
  });
  it("should reject unauthenticated access to budgets without a jwt ", async () => {
    const response = await request(server).get("/api/budgets");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Not authorized");
    expect(response.status).not.toBe(200);
  });
  it("should reject unauthenticated access to budgets without a valid jwt ", async () => {
    const response = await request(server)
      .get("/api/budgets")
      .auth("invalid", { type: "bearer" });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal server error");
    expect(response.status).not.toBe(200);
  });

  it("should allow authenticated access to budgets with a valid jwt", async () => {
    const response = await request(server)
      .get("/api/budgets")
      .auth(jwtToken, { type: "bearer" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
    expect(response.status).not.toBe(401);
  });
});

describe("POST /api/budgets", () => {
  beforeAll(async () => {
    await authenticateUser();
  });
  it("should reject unauthenticated access to create a budget without a jwt", async () => {
    const response = await request(server).post("/api/budgets");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Not authorized");
    expect(response.status).not.toBe(201);
  });
  it("should display validation errors for missing fields", async () => {
    const response = await request(server)
      .post("/api/budgets")
      .auth(jwtToken, { type: "bearer" })
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(4);
    expect(response.status).not.toBe(201);
  });
  it("should create a new budget successfully", async () => {
    const response = await request(server)
      .post("/api/budgets")
      .auth(jwtToken, { type: "bearer" })
      .send({
        name: "Monthly Budget",
        amount: 2000,
      });

    expect(response.status).toBe(201);
    expect(response.status).not.toBe(400);
  });
});

describe("GET /api/budgets/:id", () => {
  beforeAll(async () => {
    await authenticateUser();
  });
  it("should reject unauthenticated access to get a budget without a jwt", async () => {
    const response = await request(server).get("/api/budgets/1");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Not authorized");
    expect(response.status).not.toBe(200);
  });
  it("should return 400 if the id is not valid", async () => {
    const response = await request(server)
      .get("/api/budgets/invalid-id")
      .auth(jwtToken, { type: "bearer" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("Invalid ID");
    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(401);
  });
  it("should return 404 if the budget does not exist", async () => {
    const response = await request(server)
      .get("/api/budgets/999")
      .auth(jwtToken, { type: "bearer" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Budget not found");
    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(401);
  });
  it("should return a single budget by id ", async () => {
    const response = await request(server)
      .get("/api/budgets/1")
      .auth(jwtToken, { type: "bearer" });

    expect(response.status).toBe(200);
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(404);
  });
});

describe("PUT /api/budgets/:id", () => {
  beforeAll(async () => {
    await authenticateUser();
  });
  it("should reject unauthenticated access to update a budget without a jwt", async () => {
    const response = await request(server).put("/api/budgets/1");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Not authorized");
    expect(response.status).not.toBe(200);
  });
  it("should return 400 if the id is not valid", async () => {
    const response = await request(server)
      .put("/api/budgets/invalid-id")
      .auth(jwtToken, { type: "bearer" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("Invalid ID");
    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(401);
  });
  it("should display validation errors for missing fields", async () => {
    const response = await request(server)
      .put("/api/budgets/1")
      .auth(jwtToken, { type: "bearer" })
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(4);
    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(401);
  });
  it("should return 404 if the budget does not exist", async () => {
    const response = await request(server)
      .put("/api/budgets/999")
      .auth(jwtToken, { type: "bearer" })
      .send({ name: "Updated Budget", amount: 2500 });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Budget not found");
    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(401);
  });
  it("should update the budget successfully", async () => {
    const response = await request(server)
      .put("/api/budgets/1")
      .auth(jwtToken, { type: "bearer" })
      .send({ name: "Updated Budget", amount: 2500 });

    expect(response.status).toBe(200);
    expect(response.body).toBe("Budget updated successfully");
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(404);
  });
});

describe("DELETE /api/budgets/:id", () => {
  beforeAll(async () => {
    await authenticateUser();
  });
  it("should reject unauthenticated access to delete a budget without a jwt", async () => {
    const response = await request(server).delete("/api/budgets/1");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Not authorized");
    expect(response.status).not.toBe(200);
  });
  it("should return 400 if the id is not valid", async () => {
    const response = await request(server)
      .delete("/api/budgets/invalid-id")
      .auth(jwtToken, { type: "bearer" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("Invalid ID");
    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(401);
  });
  it("should return 404 if the budget does not exist", async () => {
    const response = await request(server)
      .delete("/api/budgets/999")
      .auth(jwtToken, { type: "bearer" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Budget not found");
    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(401);
  });
  it("should delete the budget successfully", async () => {
    const response = await request(server)
      .delete("/api/budgets/1")
      .auth(jwtToken, { type: "bearer" });

    expect(response.status).toBe(200);
    expect(response.body).toBe("Budget deleted successfully");
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(404);
  });
});
