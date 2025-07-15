import { 
  User, 
  Product, 
  Wishlist, 
  Order, 
  SearchHistory, 
  DailyDeals,
  type IUser,
  type IProduct,
  type IWishlist,
  type IOrder,
  type ISearchHistory,
  type IDailyDeals
} from "./models";
import { 
  InsertUser, 
  InsertProduct, 
  InsertWishlist, 
  InsertOrder, 
  InsertSearchHistory, 
  InsertDailyDeals 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<IUser | undefined>;
  getUserByEmail(email: string): Promise<IUser | undefined>;
  createUser(user: InsertUser): Promise<IUser>;
  updateUserPreferences(userId: string, preferences: { theme: "light" | "dark" }): Promise<IUser>;

  // Product operations
  getProduct(id: string): Promise<IProduct | undefined>;
  getProductsByQuery(query: string): Promise<IProduct[]>;
  createProduct(product: InsertProduct): Promise<IProduct>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<IProduct>;
  getProductsByIds(ids: string[]): Promise<IProduct[]>;

  // Wishlist operations
  getWishlistByUserId(userId: string): Promise<IWishlist[]>;
  addToWishlist(wishlistItem: InsertWishlist): Promise<IWishlist>;
  removeFromWishlist(userId: string, productId: string): Promise<boolean>;
  getWishlistItem(userId: string, productId: string): Promise<IWishlist | undefined>;

  // Order operations
  getOrdersByUserId(userId: string): Promise<IOrder[]>;
  createOrder(order: InsertOrder): Promise<IOrder>;
  updateOrderStatus(orderId: string, status: string): Promise<IOrder>;
  deleteOrder(userId: string, orderId: string): Promise<boolean>;
  getOrderById(orderId: string): Promise<IOrder | undefined>;

  // Search history operations
  getSearchHistoryByUserId(userId: string): Promise<ISearchHistory[]>;
  getSearchHistoryBySessionId(sessionId: string): Promise<ISearchHistory[]>;
  createSearchHistory(searchHistory: InsertSearchHistory): Promise<ISearchHistory>;

  // Daily deals operations
  getDailyDeals(): Promise<IDailyDeals[]>;
  createDailyDeal(deal: InsertDailyDeals): Promise<IDailyDeals>;
  updateDailyDeal(id: string, deal: Partial<InsertDailyDeals>): Promise<IDailyDeals>;
  clearOldDeals(): Promise<void>;
}

export class MongoStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<IUser | undefined> {
    try {
      return (await User.findById(id).exec()) || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<IUser | undefined> {
    try {
      return (await User.findOne({ email: email.toLowerCase() }).exec()) || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<IUser> {
    const user = new User({
      email: insertUser.email.toLowerCase(),
      passwordHash: insertUser.password, // This should be hashed in auth service
      preferences: insertUser.preferences || { theme: "light" },
    });
    return await user.save();
  }

  async updateUserPreferences(userId: string, preferences: { theme: "light" | "dark" }): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true, runValidators: true }
    ).exec();
    
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  // Product operations
  async getProduct(id: string): Promise<IProduct | undefined> {
    try {
      return (await Product.findById(id).exec()) || undefined;
    } catch (error) {
      console.error('Error getting product:', error);
      return undefined;
    }
  }

  async getProductsByQuery(query: string): Promise<IProduct[]> {
    try {
      return await Product.find({
        $text: { $search: query }
      }).sort({ score: { $meta: "textScore" } }).exec();
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  async createProduct(insertProduct: InsertProduct): Promise<IProduct> {
    const product = new Product({
      ...insertProduct,
      lastScrapedAt: new Date(),
      lastPriceChangeAt: new Date(),
    });
    return await product.save();
  }

  async updateProduct(id: string, productUpdate: Partial<InsertProduct>): Promise<IProduct> {
    const product = await Product.findByIdAndUpdate(
      id,
      { 
        ...productUpdate,
        lastScrapedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).exec();
    
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  async getProductsByIds(ids: string[]): Promise<IProduct[]> {
    try {
      return await Product.find({ _id: { $in: ids } }).exec();
    } catch (error) {
      console.error('Error getting products by IDs:', error);
      return [];
    }
  }

  // Wishlist operations
  async getWishlistByUserId(userId: string): Promise<IWishlist[]> {
    try {
      return await Wishlist.find({ userId }).sort({ addedAt: -1 }).exec();
    } catch (error) {
      console.error('Error getting wishlist:', error);
      return [];
    }
  }

  async addToWishlist(insertWishlist: InsertWishlist): Promise<IWishlist> {
    const wishlistItem = new Wishlist({
      ...insertWishlist,
      addedAt: new Date(),
    });
    return await wishlistItem.save();
  }

  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const result = await Wishlist.deleteOne({ userId, productId }).exec();
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  }

  async getWishlistItem(userId: string, productId: string): Promise<IWishlist | undefined> {
    try {
      return (await Wishlist.findOne({ userId, productId }).exec()) || undefined;
    } catch (error) {
      console.error('Error getting wishlist item:', error);
      return undefined;
    }
  }

  // Order operations
  async getOrdersByUserId(userId: string): Promise<IOrder[]> {
    try {
      return await Order.find({ userId }).sort({ createdAt: -1 }).exec();
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  async createOrder(insertOrder: InsertOrder): Promise<IOrder> {
    const order = new Order({
      ...insertOrder,
      lastStatusCheckAt: null,
    });
    return await order.save();
  }

  async updateOrderStatus(orderId: string, status: string): Promise<IOrder> {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        status,
        lastStatusCheckAt: new Date(),
      },
      { new: true, runValidators: true }
    ).exec();
    
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }

  async deleteOrder(userId: string, orderId: string): Promise<boolean> {
    try {
      const result = await Order.deleteOne({ _id: orderId, userId }).exec();
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }

  async getOrderById(orderId: string): Promise<IOrder | undefined> {
    try {
      return (await Order.findById(orderId).exec()) || undefined;
    } catch (error) {
      console.error('Error getting order:', error);
      return undefined;
    }
  }

  // Search history operations
  async getSearchHistoryByUserId(userId: string): Promise<ISearchHistory[]> {
    try {
      return await SearchHistory.find({ userId })
        .sort({ timestamp: -1 })
        .limit(50)
        .exec();
    } catch (error) {
      console.error('Error getting search history by user:', error);
      return [];
    }
  }

  async getSearchHistoryBySessionId(sessionId: string): Promise<ISearchHistory[]> {
    try {
      return await SearchHistory.find({ sessionId })
        .sort({ timestamp: -1 })
        .limit(50)
        .exec();
    } catch (error) {
      console.error('Error getting search history by session:', error);
      return [];
    }
  }

  async createSearchHistory(insertSearchHistory: InsertSearchHistory): Promise<ISearchHistory> {
    const searchHistory = new SearchHistory({
      ...insertSearchHistory,
      timestamp: new Date(),
    });
    return await searchHistory.save();
  }

  // Daily deals operations
  async getDailyDeals(): Promise<IDailyDeals[]> {
    try {
      return await DailyDeals.find()
        .sort({ scrapedAt: -1 })
        .limit(20)
        .exec();
    } catch (error) {
      console.error('Error getting daily deals:', error);
      return [];
    }
  }

  async createDailyDeal(insertDeal: InsertDailyDeals): Promise<IDailyDeals> {
    const deal = new DailyDeals({
      ...insertDeal,
      scrapedAt: new Date(),
    });
    return await deal.save();
  }

  async updateDailyDeal(id: string, dealUpdate: Partial<InsertDailyDeals>): Promise<IDailyDeals> {
    const deal = await DailyDeals.findByIdAndUpdate(
      id,
      dealUpdate,
      { new: true, runValidators: true }
    ).exec();
    
    if (!deal) {
      throw new Error("Daily deal not found");
    }
    return deal;
  }

  async clearOldDeals(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      await DailyDeals.deleteMany({
        scrapedAt: { $lt: thirtyDaysAgo }
      }).exec();
    } catch (error) {
      console.error('Error clearing old deals:', error);
    }
  }
}

// Export the MongoDB storage instance
export const storage = new MongoStorage();
