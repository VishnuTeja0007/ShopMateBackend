import mongoose, { Document, Schema } from 'mongoose';

export interface IPriceHistory {
  date: Date;
  price: number;
}

export interface IDeliveryInfo {
  status: 'free' | 'paid';
  cost?: number;
  time?: string; // e.g., "2-3 days", "Next day"
}

export interface IPlatform {
  name: string;
  logoUrl?: string;
  productUrl: string;
  currentPrice: number;
  originalPrice?: number;
  discount?: number;
  inclusivePrice: number;
  rating?: number; // Store-specific rating
  deliveryInfo?: IDeliveryInfo;
  priceHistory: IPriceHistory[];
  lastUpdated: Date;
}

export interface IProduct extends Document {
  title: string; // Changed from 'name' to 'title'
  description?: string;
  imageUrl: string;
  brand?: string;
  rating?: number; // Overall product rating
  bestValueStore?: string; // Store with lowest price
  features: string[]; // Product features/specifications
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

const deliveryInfoSchema = new Schema<IDeliveryInfo>({
  status: {
    type: String,
    enum: ['free', 'paid'],
    required: true,
  },
  cost: {
    type: Number,
  },
  time: {
    type: String,
  },
});

const platformSchema = new Schema<IPlatform>({
  name: {
    type: String,
    required: true,
  },
  logoUrl: {
    type: String,
  },
  productUrl: {
    type: String,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
  },
  discount: {
    type: Number,
    default: 0,
  },
  inclusivePrice: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  deliveryInfo: {
    type: deliveryInfoSchema,
  },
  priceHistory: {
    type: [priceHistorySchema],
    default: [],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const productSchema = new Schema<IProduct>({
  title: {
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
  brand: {
    type: String,
    trim: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  bestValueStore: {
    type: String,
    trim: true,
  },
  features: {
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
productSchema.index({ title: 'text', brand: 'text', features: 'text' });
productSchema.index({ 'platforms.name': 1 });
productSchema.index({ lastScrapedAt: -1 });
productSchema.index({ lastPriceChangeAt: -1 });
productSchema.index({ bestValueStore: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema); 