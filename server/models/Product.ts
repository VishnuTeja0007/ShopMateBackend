import mongoose, { Document, Schema } from 'mongoose';

export interface IPriceHistory {
  date: Date;
  price: number;
}

export interface IPlatform {
  name: string;
  logoUrl: string;
  productUrl: string;
  currentPrice: number;
  discount: number;
  inclusivePrice: number;
  deliveryDate?: Date;
  sellerRating?: number;
  priceHistory: IPriceHistory[];
}

export interface IProduct extends Document {
  name: string;
  description?: string;
  imageUrl: string;
  category?: string;
  brand?: string;
  productStars?: number;
  reviewsCount?: number;
  keyFeatures: string[];
  specifications: Record<string, string>;
  searchKeywords: string[];
  platforms: IPlatform[];
  lastScrapedAt: Date;
  lastPriceChangeAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const priceHistorySchema = new Schema<IPriceHistory>({
  date: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const platformSchema = new Schema<IPlatform>({
  name: {
    type: String,
    required: true,
  },
  logoUrl: {
    type: String,
    required: true,
  },
  productUrl: {
    type: String,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  inclusivePrice: {
    type: Number,
    required: true,
  },
  deliveryDate: {
    type: Date,
  },
  sellerRating: {
    type: Number,
  },
  priceHistory: {
    type: [priceHistorySchema],
    default: [],
  },
});

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  productStars: {
    type: Number,
    min: 0,
    max: 5,
  },
  reviewsCount: {
    type: Number,
    min: 0,
  },
  keyFeatures: {
    type: [String],
    default: [],
  },
  specifications: {
    type: Map,
    of: String,
    default: {},
  },
  searchKeywords: {
    type: [String],
    default: [],
  },
  platforms: {
    type: [platformSchema],
    default: [],
  },
  lastScrapedAt: {
    type: Date,
    required: true,
  },
  lastPriceChangeAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for search functionality
productSchema.index({ name: 'text', searchKeywords: 'text' });
productSchema.index({ 'platforms.name': 1 });
productSchema.index({ lastScrapedAt: -1 });
productSchema.index({ lastPriceChangeAt: -1 });

export const Product = mongoose.model<IProduct>('Product', productSchema); 