import type { Express } from "express";
import { createServer, type Server } from "http";
import { authenticateToken, optionalAuth, AuthRequest } from "./middleware/auth";
import { validateBody, validateQuery } from "./middleware/validation";
import { 
  insertUserSchema, 
  loginRequestSchema, 
  productSearchRequestSchema,
  updateUserPreferencesSchema,
  insertOrderSchema,
  insertWishlistSchema
} from "@shared/schema";
import { AuthService } from "./services/auth";
import { ProductSearchService } from "./services/productSearch";
import { WishlistService } from "./services/wishlist";
import { OrderTrackingService } from "./services/orderTracking";
import { SearchHistoryService } from "./services/searchHistory";
import { DailyDealsService } from "./services/dailyDeals";
import { storage } from "./storage";
import { Logger } from "./utils/logger";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication Routes
  app.post("/api/auth/register", validateBody(insertUserSchema), async (req, res) => {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      Logger.error("Registration failed", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", validateBody(loginRequestSchema), async (req, res) => {
    try {
      const result = await AuthService.login(req.body);
      res.json(result);
    } catch (error: any) {
      Logger.error("Login failed", error);
      res.status(401).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        userId: user.id,
        email: user.email,
        preferences: user.preferences,
      });
    } catch (error: any) {
      Logger.error("Failed to get user profile", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/users/preferences", authenticateToken, validateBody(updateUserPreferencesSchema), async (req: AuthRequest, res) => {
    try {
      await AuthService.updatePreferences(req.userId!, req.body);
      res.json({ message: "Preferences updated successfully." });
    } catch (error: any) {
      Logger.error("Failed to update preferences", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Product Search Routes
  app.get("/api/products/search", validateQuery(productSearchRequestSchema), async (req, res) => {
    try {
      const results = await ProductSearchService.searchProducts(req.query as any);
      res.json(results);
    } catch (error: any) {
      Logger.error("Product search failed", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await ProductSearchService.getProductDetails(req.params.id);
      res.json(product);
    } catch (error: any) {
      Logger.error("Failed to get product details", error);
      if (error.message === "Product not found") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Wishlist Routes
  app.get("/api/wishlist", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const wishlist = await WishlistService.getWishlist(req.userId!);
      res.json(wishlist);
    } catch (error: any) {
      Logger.error("Failed to get wishlist", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/wishlist", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { productId, productUrl, platform } = req.body;
      const result = await WishlistService.addToWishlist(req.userId!, productId, productUrl, platform);
      res.json({ message: "Product added to wishlist." });
    } catch (error: any) {
      Logger.error("Failed to add to wishlist", error);
      if (error.message === "Product already in wishlist") {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete("/api/wishlist/:productId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const result = await WishlistService.removeFromWishlist(req.userId!, req.params.productId);
      res.json(result);
    } catch (error: any) {
      Logger.error("Failed to remove from wishlist", error);
      if (error.message === "Product not found in wishlist") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Order Tracking Routes
  app.get("/api/orders", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const orders = await OrderTrackingService.getOrders(req.userId!);
      res.json(orders);
    } catch (error: any) {
      Logger.error("Failed to get orders", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/orders", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const order = await OrderTrackingService.addOrder(req.userId!, req.body);
      res.json({ message: "Order added for tracking.", order });
    } catch (error: any) {
      Logger.error("Failed to add order", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/orders/:orderId/refresh-status", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const result = await OrderTrackingService.refreshOrderStatus(req.params.orderId);
      res.json(result);
    } catch (error: any) {
      Logger.error("Failed to refresh order status", error);
      if (error.message === "Order not found") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete("/api/orders/:orderId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const result = await OrderTrackingService.deleteOrder(req.userId!, req.params.orderId);
      res.json(result);
    } catch (error: any) {
      Logger.error("Failed to delete order", error);
      if (error.message === "Order not found") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Search History Routes
  app.post("/api/search/history", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { query, productId } = req.body;
      const sessionId = req.cookies?.sessionId;
      
      const result = await SearchHistoryService.recordSearch(
        query, 
        req.userId, 
        sessionId, 
        productId
      );
      
      if (result.sessionId) {
        res.cookie('sessionId', result.sessionId, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
      }
      
      res.json(result);
    } catch (error: any) {
      Logger.error("Failed to record search", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/search/history", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const sessionId = req.cookies?.sessionId;
      const history = await SearchHistoryService.getSearchHistory(req.userId, sessionId);
      res.json(history);
    } catch (error: any) {
      Logger.error("Failed to get search history", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Daily Deals Routes
  app.get("/api/deals", async (req, res) => {
    try {
      const deals = await DailyDealsService.getDailyDeals();
      res.json(deals);
    } catch (error: any) {
      Logger.error("Failed to get daily deals", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
