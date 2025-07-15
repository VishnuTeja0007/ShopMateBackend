import mongoose, { Document, Schema } from 'mongoose';

export interface ISearchHistory extends Document {
  query: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  productId?: string;
}

const searchHistorySchema = new Schema<ISearchHistory>({
  query: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: String,
    ref: 'User',
  },
  sessionId: {
    type: String,
  },
  productId: {
    type: String,
    ref: 'Product',
  },
}, {
  timestamps: false, // We only want timestamp, not createdAt/updatedAt
});

// Indexes for efficient queries
searchHistorySchema.index({ userId: 1, timestamp: -1 });
searchHistorySchema.index({ sessionId: 1, timestamp: -1 });
searchHistorySchema.index({ query: 1 });
searchHistorySchema.index({ timestamp: -1 });

export const SearchHistory = mongoose.model<ISearchHistory>('SearchHistory', searchHistorySchema); 