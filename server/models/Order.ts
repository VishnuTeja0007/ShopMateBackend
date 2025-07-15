import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  userId: string;
  orderId: string;
  productName: string;
  platform: string;
  purchaseDate: Date;
  status: string;
  orderUrl: string;
  createdAt: Date;
  updatedAt: Date;
  lastStatusCheckAt?: Date;
}

const orderSchema = new Schema<IOrder>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  orderId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  platform: {
    type: String,
    required: true,
    trim: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    trim: true,
  },
  orderUrl: {
    type: String,
    required: true,
  },
  lastStatusCheckAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
orderSchema.index({ userId: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ platform: 1 });
orderSchema.index({ lastStatusCheckAt: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema); 