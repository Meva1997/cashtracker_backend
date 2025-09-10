import { createRequest, createResponse } from "node-mocks-http";
import { AuthController } from "../../../controllers/AuthController";
import User from "../../../models/User";
import { hashPassword, verifyPassword } from "../../../utils/auth";
import { generateToken } from "../../../utils/token";
import { AuthEmail } from "../../../emails/AuthEmail";
import { generateJWT } from "../../../utils/jwt";

jest.mock("../../../models/User");
jest.mock("../../../utils/auth");
jest.mock("../../../utils/token");
jest.mock("../../../utils/jwt");

describe("AuthController.createAccount", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it("should return 409 status and an error message if the email already exists", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(true);
    const req = createRequest({
      method: "POST",
      url: "/api/auth/create-account",
      body: {
        email: "test@test.com",
        password: "password123",
      },
    });

    const res = createResponse();

    await AuthController.createAccount(req, res);
    expect(res.statusCode).toBe(409);
    const data = res._getJSONData();
    expect(data).toEqual({ error: "A user with this email already exists" });
    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledTimes(1);
  });

  it("should register a new user and return success message", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    const req = createRequest({
      method: "POST",
      url: "/api/auth/create-account",
      body: {
        email: "test@test.com",
        password: "password123",
        name: "Test User",
      },
    });
    const res = createResponse();

    const mockUser = {
      ...req.body,
      save: jest.fn().mockResolvedValue(true),
    };
    (User.create as jest.Mock).mockResolvedValue(mockUser);
    (hashPassword as jest.Mock).mockResolvedValue("hashedPassword");
    (generateToken as jest.Mock).mockReturnValue("generatedToken");
    jest
      .spyOn(AuthEmail, "sendConfirmationEmail")
      .mockImplementation(() => Promise.resolve());
    await AuthController.createAccount(req, res);

    expect(res.statusCode).toBe(201);
    const data = res._getJSONData();
    expect(data).toBe("User created successfully");
    expect(User.findOne).toHaveBeenCalled();
    expect(User.create).toHaveBeenCalledWith(req.body);
    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(generateToken).toHaveBeenCalled();
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockUser.password).toBe("hashedPassword");
    expect(mockUser.token).toBe("generatedToken");
    expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
      name: "Test User",
      email: "test@test.com",
      token: "generatedToken",
    });
    expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1);
  });
});

describe("AuthController.login", () => {
  it("should return 404 status if user does not exist", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "password123",
      },
    });
    const res = createResponse();

    await AuthController.login(req, res);
    expect(res.statusCode).toBe(404);
    const data = res._getJSONData();
    expect(data).toEqual({ error: "User does not exist" });
    expect(User.findOne).toHaveBeenCalledWith({
      where: { email: "test@test.com" },
    });
  });
  it("should return 401 status if user is not confirmed", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      email: "test@test.com",
      password: "hashedPassword",
      confirmed: false,
    });

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "password123",
      },
    });
    const res = createResponse();

    await AuthController.login(req, res);
    expect(res.statusCode).toBe(403);
    const data = res._getJSONData();
    expect(data).toEqual({ error: "Account not confirmed" });
    expect(User.findOne).toHaveBeenCalledWith({
      where: { email: "test@test.com" },
    });
  });
  it("should return 401 status if password is incorrect", async () => {
    (verifyPassword as jest.Mock).mockResolvedValue(false);

    (User.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      email: "test@test.com",
      password: "hashedPassword",
      confirmed: true,
    });

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "wrongPassword",
      },
    });
    const res = createResponse();

    await AuthController.login(req, res);
    expect(res.statusCode).toBe(401);
    const data = res._getJSONData();
    expect(data).toEqual({ error: "Incorrect password" });
    expect(verifyPassword).toHaveBeenCalledWith(
      req.body.password,
      "hashedPassword"
    );
    expect(verifyPassword).toHaveBeenCalledTimes(1);
  });
  it("should return a token if login is successful", async () => {
    const userMock = {
      id: 1,
      email: "test@test.com",
      password: "hashedPassword",
      confirmed: true,
    };
    (verifyPassword as jest.Mock).mockResolvedValue(true);
    (User.findOne as jest.Mock).mockResolvedValue(userMock);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "password123",
      },
    });

    const res = createResponse();
    const mockToken = "jwtToken";
    (generateJWT as jest.Mock).mockReturnValue(mockToken);

    await AuthController.login(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data).toBe(mockToken);
    expect(generateJWT).toHaveBeenCalledWith(userMock.id);
    expect(generateJWT).toHaveBeenCalledTimes(1);
  });
});
