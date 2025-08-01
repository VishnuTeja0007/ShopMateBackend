import { storage } from "../storage";
import { InsertWishlist } from "@shared/schema";
import { Logger } from "../utils/logger";

export class WishlistService {
  static async getWishlist(userId: string) {
    try {
      const wishlistItems = await storage.getWishlistByUserId(userId);
      
      // Since products are no longer stored in DB, we'll return basic wishlist info
      const wishlistWithProducts = wishlistItems.map(item => {
        return {
          productId: item.productId,
          // Product details would need to be fetched from session or external API
          title: "Product details not available (stored in session)",
          imageUrl: "",
          currentLowestPrice: 0,
          targetPrice: item.targetPrice,
          platforms: [],
        };
      });

      Logger.info(`Retrieved wishlist for user: ${userId}`);
      return wishlistWithProducts;
    } catch (error) {
      Logger.error("Failed to get wishlist", error);
      throw error;
    }
  }

  static async addToWishlist(userId: string, productId: string, productUrl: string, platform: string) {
    try {
      // Check if item already exists in wishlist
      const existingItem = await storage.getWishlistItem(userId, productId);
      if (existingItem) {
        throw new Error("Product already in wishlist");
      }

      // Add to wishlist
      const wishlistItem: InsertWishlist = {
        userId,
        productId,
        targetPrice: null,
      };

      const newItem = await storage.addToWishlist(wishlistItem);
      Logger.info(`Added product ${productId} to wishlist for user ${userId}`);
      
      return newItem;
    } catch (error) {
      Logger.error("Failed to add to wishlist", error);
      throw error;
    }
  }

  static async removeFromWishlist(userId: string, productId: string) {
    try {
      const success = await storage.removeFromWishlist(userId, productId);
      if (!success) {
        throw new Error("Product not found in wishlist");
      }

      Logger.info(`Removed product ${productId} from wishlist for user ${userId}`);
      return { message: "Product removed from wishlist." };
    } catch (error) {
      Logger.error("Failed to remove from wishlist", error);
      throw error;
    }
  }
}
