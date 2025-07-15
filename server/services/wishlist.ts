import { storage } from "../storage";
import { InsertWishlist } from "@shared/schema";
import { Logger } from "../utils/logger";

export class WishlistService {
  static async getWishlist(userId: string) {
    try {
      const wishlistItems = await storage.getWishlistByUserId(userId);
      const productIds = wishlistItems.map(item => item.productId);
      const products = await storage.getProductsByIds(productIds);

      const wishlistWithProducts = wishlistItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;

        return {
          productId: item.productId,
          name: product.name,
          imageUrl: product.imageUrl,
          currentLowestPrice: Math.min(...product.platforms.map(p => p.currentPrice)),
          targetPrice: item.targetPrice,
          platforms: product.platforms,
        };
      }).filter(Boolean);

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
