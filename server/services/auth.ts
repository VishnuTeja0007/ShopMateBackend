import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "../storage";
import { InsertUser, LoginRequest } from "@shared/schema";
import { Logger } from "../utils/logger";
import { IUser } from "../models";

// No changes needed, dotenv is loaded in index.ts
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
console.log(JWT_SECRET);
const SALT_ROUNDS = 12;

export class AuthService {
  static async register(userData: InsertUser) {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

      // Create user
      const user = await storage.createUser({
        ...userData,
        password: passwordHash,
      }) as IUser;

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      Logger.info(`User registered successfully: ${user.email}`);

      return {
        token,
        userId: user._id.toString(),
        email: user.email,
      };
    } catch (error) {
      Logger.error("Registration failed", error);
      throw error;
    }
  }

  static async login(credentials: LoginRequest) {
    try {
      // Find user by email
      const user = await storage.getUserByEmail(credentials.email) as IUser;
      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      Logger.info(`User logged in successfully: ${user.email}`);

      return {
        token,
        userId: user._id.toString(),
        email: user.email,
      };
    } catch (error) {
      Logger.error("Login failed", error);
      throw error;
    }
  }

  static async updatePreferences(userId: string, preferences: { theme: "light" | "dark" }) {
    try {
      const user = await storage.updateUserPreferences(userId, preferences);
      Logger.info(`User preferences updated: ${user.email}`);
      return user;
    } catch (error) {
      Logger.error("Failed to update preferences", error);
      throw error;
    }
  }
}
