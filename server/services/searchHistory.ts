import { storage } from "../storage";
import { InsertSearchHistory } from "@shared/schema";
import { Logger } from "../utils/logger";
import { nanoid } from "nanoid";

export class SearchHistoryService {
  static async recordSearch(query: string, userId?: string, sessionId?: string, productId?: string) {
    try {
      // Skip common searches
      const commonQueries = ["smartphones", "laptops", "dresses", "shoes", "electronics"];
      if (commonQueries.includes(query.toLowerCase())) {
        return { message: "Common search not recorded." };
      }

      // Generate session ID if not provided and no user ID
      if (!userId && !sessionId) {
        sessionId = nanoid();
      }

      const searchHistory: InsertSearchHistory = {
        query,
        timestamp: new Date(),
        userId: userId || null,
        sessionId: sessionId || null,
        productId: productId || null,
      };

      await storage.createSearchHistory(searchHistory);
      Logger.info(`Recorded search: ${query}`);
      
      return { 
        message: "Search query recorded.", 
        sessionId: !userId ? sessionId : undefined 
      };
    } catch (error) {
      Logger.error("Failed to record search", error);
      throw error;
    }
  }

  static async getSearchHistory(userId?: string, sessionId?: string) {
    try {
      let history;
      
      if (userId) {
        history = await storage.getSearchHistoryByUserId(userId);
      } else if (sessionId) {
        history = await storage.getSearchHistoryBySessionId(sessionId);
      } else {
        throw new Error("User ID or session ID required");
      }

      // Get product details for searches that have productId
      const enrichedHistory = await Promise.all(
        history.map(async (item) => {
          let productName = undefined;
          if (item.productId) {
            const product = await storage.getProduct(item.productId);
            productName = product?.name;
          }

          return {
            query: item.query,
            timestamp: item.timestamp,
            productId: item.productId,
            productName,
          };
        })
      );

      Logger.info(`Retrieved search history for ${userId ? 'user' : 'session'}`);
      return enrichedHistory;
    } catch (error) {
      Logger.error("Failed to get search history", error);
      throw error;
    }
  }
}
