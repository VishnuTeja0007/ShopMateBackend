import { 
  User, 
  InsertUser, 
  Product, 
  InsertProduct, 
  Wishlist, 
  InsertWishlist, 
  Order, 
  InsertOrder, 
  SearchHistory, 
  InsertSearchHistory, 
  DailyDeals, 
  InsertDailyDeals 
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(userId: string, preferences: { theme: "light" | "dark" }): Promise<User>;

  // Product operations
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByQuery(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  getProductsByIds(ids: string[]): Promise<Product[]>;

  // Wishlist operations
  getWishlistByUserId(userId: string): Promise<Wishlist[]>;
  addToWishlist(wishlistItem: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, productId: string): Promise<boolean>;
  getWishlistItem(userId: string, productId: string): Promise<Wishlist | undefined>;

  // Order operations
  getOrdersByUserId(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(orderId: string, status: string): Promise<Order>;
  deleteOrder(userId: string, orderId: string): Promise<boolean>;
  getOrderById(orderId: string): Promise<Order | undefined>;

  // Search history operations
  getSearchHistoryByUserId(userId: string): Promise<SearchHistory[]>;
  getSearchHistoryBySessionId(sessionId: string): Promise<SearchHistory[]>;
  createSearchHistory(searchHistory: InsertSearchHistory): Promise<SearchHistory>;

  // Daily deals operations
  getDailyDeals(): Promise<DailyDeals[]>;
  createDailyDeal(deal: InsertDailyDeals): Promise<DailyDeals>;
  updateDailyDeal(id: string, deal: Partial<InsertDailyDeals>): Promise<DailyDeals>;
  clearOldDeals(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private wishlists: Map<string, Wishlist> = new Map();
  private orders: Map<string, Order> = new Map();
  private searchHistory: Map<string, SearchHistory> = new Map();
  private dailyDeals: Map<string, DailyDeals> = new Map();

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = nanoid();
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      passwordHash: insertUser.password, // This should be hashed in auth service
      preferences: insertUser.preferences || { theme: "light" },
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPreferences(userId: string, preferences: { theme: "light" | "dark" }): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser: User = {
      ...user,
      preferences,
      updatedAt: new Date(),
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Product operations
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByQuery(query: string): Promise<Product[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.products.values()).filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.searchKeywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = nanoid();
    const now = new Date();
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, productUpdate: Partial<InsertProduct>): Promise<Product> {
    const product = this.products.get(id);
    if (!product) throw new Error("Product not found");
    
    const updatedProduct: Product = {
      ...product,
      ...productUpdate,
      updatedAt: new Date(),
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    return ids.map(id => this.products.get(id)).filter(Boolean) as Product[];
  }

  // Wishlist operations
  async getWishlistByUserId(userId: string): Promise<Wishlist[]> {
    return Array.from(this.wishlists.values()).filter(item => item.userId === userId);
  }

  async addToWishlist(insertWishlist: InsertWishlist): Promise<Wishlist> {
    const id = nanoid();
    const wishlistItem: Wishlist = {
      ...insertWishlist,
      id,
      addedAt: new Date(),
    };
    this.wishlists.set(id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    const item = Array.from(this.wishlists.values()).find(
      w => w.userId === userId && w.productId === productId
    );
    if (item) {
      this.wishlists.delete(item.id);
      return true;
    }
    return false;
  }

  async getWishlistItem(userId: string, productId: string): Promise<Wishlist | undefined> {
    return Array.from(this.wishlists.values()).find(
      w => w.userId === userId && w.productId === productId
    );
  }

  // Order operations
  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = nanoid();
    const now = new Date();
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: now,
      updatedAt: now,
      lastStatusCheckAt: null,
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) throw new Error("Order not found");
    
    const updatedOrder: Order = {
      ...order,
      status,
      updatedAt: new Date(),
      lastStatusCheckAt: new Date(),
    };
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  async deleteOrder(userId: string, orderId: string): Promise<boolean> {
    const order = this.orders.get(orderId);
    if (order && order.userId === userId) {
      this.orders.delete(orderId);
      return true;
    }
    return false;
  }

  async getOrderById(orderId: string): Promise<Order | undefined> {
    return this.orders.get(orderId);
  }

  // Search history operations
  async getSearchHistoryByUserId(userId: string): Promise<SearchHistory[]> {
    return Array.from(this.searchHistory.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getSearchHistoryBySessionId(sessionId: string): Promise<SearchHistory[]> {
    return Array.from(this.searchHistory.values())
      .filter(history => history.sessionId === sessionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createSearchHistory(insertSearchHistory: InsertSearchHistory): Promise<SearchHistory> {
    const id = nanoid();
    const searchHistory: SearchHistory = {
      ...insertSearchHistory,
      id,
    };
    this.searchHistory.set(id, searchHistory);
    return searchHistory;
  }

  // Daily deals operations
  async getDailyDeals(): Promise<DailyDeals[]> {
    return Array.from(this.dailyDeals.values())
      .sort((a, b) => b.scrapedAt.getTime() - a.scrapedAt.getTime());
  }

  async createDailyDeal(insertDeal: InsertDailyDeals): Promise<DailyDeals> {
    const id = nanoid();
    const now = new Date();
    const deal: DailyDeals = {
      ...insertDeal,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.dailyDeals.set(id, deal);
    return deal;
  }

  async updateDailyDeal(id: string, dealUpdate: Partial<InsertDailyDeals>): Promise<DailyDeals> {
    const deal = this.dailyDeals.get(id);
    if (!deal) throw new Error("Deal not found");
    
    const updatedDeal: DailyDeals = {
      ...deal,
      ...dealUpdate,
      updatedAt: new Date(),
    };
    this.dailyDeals.set(id, updatedDeal);
    return updatedDeal;
  }

  async clearOldDeals(): Promise<void> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const toDelete = Array.from(this.dailyDeals.values())
      .filter(deal => deal.scrapedAt < oneDayAgo)
      .map(deal => deal.id);
    
    toDelete.forEach(id => this.dailyDeals.delete(id));
  }
}

export const storage = new MemStorage();
