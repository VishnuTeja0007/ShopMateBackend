import { storage } from "../storage";
import { InsertOrder } from "@shared/schema";
import { Logger } from "../utils/logger";

export class OrderTrackingService {
  static async getOrders(userId: string) {
    try {
      const orders = await storage.getOrdersByUserId(userId);
      Logger.info(`Retrieved orders for user: ${userId}`);
      return orders;
    } catch (error) {
      Logger.error("Failed to get orders", error);
      throw error;
    }
  }

  static async addOrder(userId: string, orderData: Omit<InsertOrder, "userId">) {
    try {
      const order: InsertOrder = {
        ...orderData,
        userId,
        status: "Pending", // Default status
      };

      // Scrape initial status from orderUrl
      const initialStatus = await this.scrapeOrderStatus(order.orderUrl);
      order.status = initialStatus;

      const newOrder = await storage.createOrder(order);
      Logger.info(`Added order ${order.orderId} for user ${userId}`);
      
      return newOrder;
    } catch (error) {
      Logger.error("Failed to add order", error);
      throw error;
    }
  }

  static async refreshOrderStatus(orderId: string) {
    try {
      const order = await storage.getOrderById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      // Scrape latest status
      const newStatus = await this.scrapeOrderStatus(order.orderUrl);
      
      // Update order with new status
      await storage.updateOrderStatus(orderId, newStatus);
      
      Logger.info(`Updated order ${orderId} status to: ${newStatus}`);
      return { message: "Order status updated.", newStatus };
    } catch (error) {
      Logger.error("Failed to refresh order status", error);
      throw error;
    }
  }

  static async deleteOrder(userId: string, orderId: string) {
    try {
      const success = await storage.deleteOrder(userId, orderId);
      if (!success) {
        throw new Error("Order not found");
      }

      Logger.info(`Deleted order ${orderId} for user ${userId}`);
      return { message: "Order removed." };
    } catch (error) {
      Logger.error("Failed to delete order", error);
      throw error;
    }
  }

  private static async scrapeOrderStatus(orderUrl: string): Promise<string> {
    try {
      // This is a simplified implementation
      // In a real implementation, you would use Puppeteer or Cheerio to scrape the order status
      Logger.info(`Scraping order status from: ${orderUrl}`);
      
      // For now, return a mock status
      // In production, this would actually scrape the order page
      const mockStatuses = ["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered"];
      return mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    } catch (error) {
      Logger.error("Failed to scrape order status", error);
      return "Status unavailable";
    }
  }
}
