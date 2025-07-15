# MongoDB Setup Guide

## Overview
This project has been migrated from PostgreSQL/Drizzle to MongoDB/Mongoose for better scalability and flexibility.

## Prerequisites
1. MongoDB installed and running locally, or a MongoDB Atlas account
2. Node.js and npm installed

## Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://VishnuTejaSM:<db_password>@cluster0.sz5jdot.mongodb.net/

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# SERP API
SERP_API_KEY=your-serp-api-key-here

# Server Configuration
NODE_ENV=development
PORT=5000
```

- Replace `<db_password>` with your actual MongoDB Atlas password.
- Replace `your-serp-api-key-here` with your actual SERP API private key.

## Local MongoDB Setup

### Option 1: MongoDB Community Edition
1. Download and install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Create database: `shopmate`

### Option 2: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Option 3: MongoDB Atlas (Cloud)
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

## Installation
```bash
npm install
```

## Running the Application
```bash
npm run dev
```

## Database Collections
The application will automatically create the following collections:
- `users` - User accounts and preferences
- `products` - Product information and price history
- `wishlists` - User wishlist items
- `orders` - Order tracking information
- `searchhistories` - Search query history
- `dailydeals` - Daily deals and promotions

## Indexes
The following indexes are automatically created for optimal performance:
- User email (unique)
- Product text search (name, keywords)
- Wishlist user-product combination (unique)
- Order user and platform
- Search history by user/session and timestamp
- Daily deals by platform and scraped date

## Migration Notes
- All IDs are now MongoDB ObjectIds instead of string IDs
- Timestamps are automatically managed by Mongoose
- Text search is available on product names and keywords
- Unique constraints are enforced at the database level 