import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  name : string,
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  preferences: {
    theme: 'light' | 'dark';
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name:{
    type: String,
    required: true,
    trim: true,

  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
  },
}, {
  timestamps: true,
});

// Index for email lookups
userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', userSchema); 