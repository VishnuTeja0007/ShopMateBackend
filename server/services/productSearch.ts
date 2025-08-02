import axios from "axios";
import { storage } from "../storage";
import { InsertProduct, ProductSearchRequest } from "@shared/schema";
import { Logger } from "../utils/logger";

// Load SERP API key from environment variable
const SERP_API_KEY = process.env.SERP_API_KEY;
if (!SERP_API_KEY) {
  throw new Error("SERP_API_KEY is not set in the environment variables. Please add it to your .env file.");
}
const SERP_API_URL = "https://serpapi.com/search.json";

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
      Logger.info(`Search successfull Products: ${JSON.stringify(products)}`) ;
    } catch (error) {
      Logger.error("Product search failed", error);
      throw error;
    }
  }

  static async getProductDetails(productId: string) {
    try {
      // First, check if product exists in database
      const product = await storage.getProduct(productId);
      
      if (product) {
        // Product found in database - update price history with today's prices
        Logger.info(`Product found in database: ${product.name}`);
        
        // Update price history for all platforms
        const updatedPlatforms = product.platforms.map(platform => ({
          ...platform,
          priceHistory: [
            ...platform.priceHistory,
            {
              date: new Date(),
              price: platform.currentPrice,
            }
          ],
          deliveryDate: platform.deliveryDate || null,
          sellerRating: platform.sellerRating || null,
        }));

        // Update the product in database
        const updatedProduct = await storage.updateProduct(productId, {
          platforms: updatedPlatforms,
          lastPriceChangeAt: new Date(),
        });

        return {
          id: updatedProduct.id,
          name: updatedProduct.name,
          description: updatedProduct.description,
          imageUrl: updatedProduct.imageUrl,
          brand: updatedProduct.brand,
          productStars: updatedProduct.productStars,
          platforms: updatedProduct.platforms,
          lastPriceChangeAt: updatedProduct.lastPriceChangeAt,
        };
      } else {
        // Product not found in database - fetch from SERP API
        Logger.info(`Product not found in database, fetching from SERP API: ${productId}`);
        
        const serpResponse = await this.callGoogleProductApi(productId);
        const newProduct = await this.processGoogleProductResult(serpResponse, productId);
        
        return {
          id: newProduct.id,
          name: newProduct.name,
          description: newProduct.description,
          imageUrl: newProduct.imageUrl,
          brand: newProduct.brand,
          productStars: newProduct.productStars,
          platforms: newProduct.platforms,
          lastPriceChangeAt: newProduct.lastPriceChangeAt,
        };
      }
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

  private static async callGoogleProductApi(productId: string) {
    const params = {
      engine: "google_product",
      product_id: productId,
      gl: "in",
      api_key: SERP_API_KEY,
    };

    const response = await axios.get(SERP_API_URL, { params });
    return response.data;
  }

  private static async processGoogleProductResult(serpData: any, productId: string): Promise<any> {
    if (!serpData.product_results || serpData.product_results.length === 0) {
      throw new Error("No product details found");
    }

    const productData = serpData.product_results[0];
    
    const product: InsertProduct = {
      name: productData.title || "unavailable",
      description: productData.description || null,
      imageUrl: productData.thumbnail || "",
      category: null,
      brand: productData.brand || null,
      productStars: productData.rating || null,
      reviewsCount: productData.reviews || null,
      keyFeatures: [],
      specifications: {},
      searchKeywords: [],
      platforms: [{
        name: productData.source || "Unknown",
        logoUrl: "",
        productUrl: productData.product_link || "",
        currentPrice: this.extractPrice(productData.price) || 0,
        discount: 0,
        inclusivePrice: this.extractPrice(productData.price) || 0,
        deliveryDate: null,
        sellerRating: null,
        priceHistory: [{
          date: new Date(),
          price: this.extractPrice(productData.price) || 0,
        }],
      }],
      lastScrapedAt: new Date(),
      lastPriceChangeAt: new Date(),
    };

    // Create new product in database
    const newProduct = await storage.createProduct(product);
    return newProduct;
  }
}
