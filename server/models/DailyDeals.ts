import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyDeals extends Document {
  name: string;
  imageUrl: string;
  originalPrice: number;
  dealPrice: number;
  discountPercentage: number;
  platform: string;
  productUrl: string;
  scrapedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const dailyDealsSchema = new Schema<IDailyDeals>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  dealPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  platform: {
    type: String,
    required: true,
    trim: true,
  },
  productUrl: {
    type: String,
    required: true,
  },
  scrapedAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
dailyDealsSchema.index({ platform: 1 });
dailyDealsSchema.index({ scrapedAt: -1 });
dailyDealsSchema.index({ discountPercentage: -1 });

export const DailyDeals = mongoose.model<IDailyDeals>('DailyDeals', dailyDealsSchema); 