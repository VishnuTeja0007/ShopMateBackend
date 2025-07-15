import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlist extends Document {
  userId: string;
  productId: string;
  addedAt: Date;
  targetPrice?: number;
}

const wishlistSchema = new Schema<IWishlist>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  productId: {
    type: String,
    required: true,
    ref: 'Product',
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  targetPrice: {
    type: Number,
    min: 0,
  },
}, {
  timestamps: false, // We only want addedAt, not createdAt/updatedAt
});

// Compound index to ensure unique user-product combinations
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Index for user lookups
wishlistSchema.index({ userId: 1 });

export const Wishlist = mongoose.model<IWishlist>('Wishlist', wishlistSchema); 