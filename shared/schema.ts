import { z } from "zod";

// User Schema
export const userSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
  preferences: z.object({
    theme: z.enum(["light", "dark"]).default("light"),
  }).default({ theme: "light" }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  preferences: z.object({
    theme: z.enum(["light", "dark"]).default("light"),
  }).optional(),
});

// Product Schema
export const productSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string(),
  brand: z.string().nullable(),
  rating: z.number().nullable(),
  bestValueStore: z.string().nullable(),
  features: z.array(z.string()).default([]),
  platforms: z.array(z.object({
    name: z.string(),
    logoUrl: z.string().nullable(),
    productUrl: z.string(),
    currentPrice: z.number(),
    originalPrice: z.number().nullable(),
    discount: z.number().nullable(),
    inclusivePrice: z.number(),
    rating: z.number().nullable(),
    deliveryInfo: z.object({
      status: z.enum(['free', 'paid']),
      cost: z.number().nullable(),
      time: z.string().nullable(),
    }).nullable(),
    priceHistory: z.array(z.object({
      date: z.date(),
      price: z.number(),
    })).default([]),
    lastUpdated: z.date(),
  })).default([]),
  lastScrapedAt: z.date(),
  lastPriceChangeAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertProductSchema = productSchema.omit({ 
  _id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Wishlist Schema
export const wishlistSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  productId: z.string(),
  addedAt: z.date(),
  targetPrice: z.number().nullable(),
});

export const insertWishlistSchema = wishlistSchema.omit({ 
  _id: true, 
  addedAt: true 
});

// Order Schema
export const orderSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  orderId: z.string(),
  productName: z.string(),
  platform: z.string(),
  purchaseDate: z.date(),
  status: z.string(),
  orderUrl: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastStatusCheckAt: z.date().nullable(),
});

export const insertOrderSchema = orderSchema.omit({ 
  _id: true, 
  createdAt: true, 
  updatedAt: true, 
  lastStatusCheckAt: true 
});



// Daily Deals Schema
export const dailyDealsSchema = z.object({
  _id: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  originalPrice: z.number(),
  dealPrice: z.number(),
  discountPercentage: z.number(),
  platform: z.string(),
  productUrl: z.string(),
  scrapedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertDailyDealsSchema = dailyDealsSchema.omit({ 
  _id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Request/Response Types
export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const productSearchRequestSchema = z.object({
  q: z.string().min(1),
  sort: z.enum(["price_asc", "price_desc"]).optional(),
  platform: z.string().optional(),
});

export const updateUserPreferencesSchema = z.object({
  theme: z.enum(["light", "dark"]),
});

export const refreshOrderStatusSchema = z.object({
  orderId: z.string(),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = z.infer<typeof productSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Wishlist = z.infer<typeof wishlistSchema>;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type DailyDeals = z.infer<typeof dailyDealsSchema>;
export type InsertDailyDeals = z.infer<typeof insertDailyDealsSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type ProductSearchRequest = z.infer<typeof productSearchRequestSchema>;
export type UpdateUserPreferences = z.infer<typeof updateUserPreferencesSchema>;
export type RefreshOrderStatus = z.infer<typeof refreshOrderStatusSchema>;
