import axios from "axios";
import { storage } from "../storage";
import { InsertProduct, ProductSearchRequest } from "@shared/schema";
import { Logger } from "../utils/logger";

const SERP_API_KEY = process.env.SERP_API_KEY || "default_serp_key";
const SERP_API_URL = "https://serpapi.com/search";

export class ProductSearchService {
  static async searchProducts(searchParams: ProductSearchRequest) {
    try {
      Logger.info(`Searching products for query: ${searchParams.q}`);

      // First, check if we have cached results
      const cachedProducts = await storage.getProductsByQuery(searchParams.q);
      
      // If we have recent cached results, return them
      if (cachedProducts.length > 0) {
        const recentProducts = cachedProducts.filter(product => {
          const hoursSinceLastScrape = (Date.now() - product.lastScrapedAt.getTime()) / (1000 * 60 * 60);
          return hoursSinceLastScrape < 1; // Use cache if scraped within last hour
        });

        if (recentProducts.length > 0) {
          return this.formatSearchResults(recentProducts, searchParams);
        }
      }

      // Make SERP API call
      const serpResponse = await this.callSerpApi(searchParams);
      
      // Process and store results
      const products = await this.processSerpResults(serpResponse, searchParams.q);
      
      // Format and return results
      return this.formatSearchResults(products, searchParams);
    } catch (error) {
      Logger.error("Product search failed", error);
      throw error;
    }
  }

  static async getProductDetails(productId: string) {
    try {
      const product = await storage.getProduct(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      // Check if product data is recent
      const hoursSinceLastScrape = (Date.now() - product.lastScrapedAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastScrape > 24) {
        // Refresh product data if it's older than 24 hours
        Logger.info(`Refreshing product data for: ${product.name}`);
        // In a real implementation, you would re-scrape the product here
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrls: [product.imageUrl],
        platforms: product.platforms,
        priceHistory: product.platforms.length > 0 ? product.platforms[0].priceHistory : [],
        overallRating: product.productStars,
        reviewCount: product.reviewsCount,
        lastPriceChangeAt: product.lastPriceChangeAt,
      };
    } catch (error) {
      Logger.error("Failed to get product details", error);
      throw error;
    }
  }

  private static async callSerpApi(searchParams: ProductSearchRequest) {
    const params = {
      engine: "google_shopping",
      q: searchParams.q,
      api_key: SERP_API_KEY,
      location: "India",
      hl: "en",
      gl: "in",
    };

    const response = await axios.get(SERP_API_URL, { params });
    return response.data;
  }

  private static async processSerpResults(serpData: any, query: string): Promise<any[]> {
    const products = [];
    
    if (serpData.shopping_results) {
      for (const item of serpData.shopping_results) {
        const product: InsertProduct = {
          name: item.title || "unavailable",
          description: item.snippet || null,
          imageUrl: item.thumbnail || "",
          category: null,
          brand: item.brand || null,
          productStars: item.rating || null,
          reviewsCount: item.reviews || null,
          keyFeatures: [],
          specifications: {},
          searchKeywords: [query],
          platforms: [{
            name: item.source || "Unknown",
            logoUrl: "",
            productUrl: item.link || "",
            currentPrice: this.extractPrice(item.price) || 0,
            discount: 0,
            inclusivePrice: this.extractPrice(item.price) || 0,
            deliveryDate: null,
            sellerRating: null,
            priceHistory: [{
              date: new Date(),
              price: this.extractPrice(item.price) || 0,
            }],
          }],
          lastScrapedAt: new Date(),
          lastPriceChangeAt: new Date(),
        };

        // Store or update product
        const existingProducts = await storage.getProductsByQuery(item.title || "");
        const existingProduct = existingProducts.find(p => p.name === product.name);
        
        if (existingProduct) {
          // Update existing product
          const updatedProduct = await storage.updateProduct(existingProduct.id, product);
          products.push(updatedProduct);
        } else {
          // Create new product
          const newProduct = await storage.createProduct(product);
          products.push(newProduct);
        }
      }
    }

    return products;
  }

  private static formatSearchResults(products: any[], searchParams: ProductSearchRequest) {
    let results = products.map(product => ({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      lowestPrice: Math.min(...product.platforms.map((p: any) => p.currentPrice)),
      bestValue: false, // Will be calculated
      platforms: product.platforms,
      priceHistory: product.platforms.length > 0 ? product.platforms[0].priceHistory : [],
    }));

    // Apply platform filtering
    if (searchParams.platform) {
      const platformFilter = searchParams.platform.split(',').map(p => p.trim().toLowerCase());
      results = results.filter(product => 
        product.platforms.some((platform: any) => 
          platformFilter.includes(platform.name.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (searchParams.sort === "price_asc") {
      results.sort((a, b) => a.lowestPrice - b.lowestPrice);
    } else if (searchParams.sort === "price_desc") {
      results.sort((a, b) => b.lowestPrice - a.lowestPrice);
    }

    // Mark best value (lowest price)
    if (results.length > 0) {
      const lowestPrice = Math.min(...results.map(r => r.lowestPrice));
      results.forEach(result => {
        result.bestValue = result.lowestPrice === lowestPrice;
      });
    }

    return results;
  }

  private static extractPrice(priceString: string): number {
    if (!priceString) return 0;
    const match = priceString.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, '')) : 0;
  }
}
