import axios from "axios";
import { ProductSearchRequest } from "@shared/schema";
import { Logger } from "../utils/logger";

// Load SERP API key from environment variable
const SERP_API_KEY = process.env.SERP_API_KEY;
if (!SERP_API_KEY) {
  throw new Error("SERP_API_KEY is not set in the environment variables. Please add it to your .env file.");
}
const SERP_API_URL = "https://serpapi.com/search.json";

export interface ISearchProduct {
  id: string;
  title: string;
  product_id: string;
  product_link: string;
  source: string;
  price: number;
  rating?: number;
  reviews?: number;
  images: string[];
}

export class ProductSearchService {
  static async searchProducts(searchParams: ProductSearchRequest): Promise<ISearchProduct[]> {
    try {
      Logger.info(`Searching products for query: ${searchParams.q}`);

      // Make SERP API call
      const serpResponse = await this.callSerpApi(searchParams);
      
      // Process SERP results without storing in database
      const products = this.processSerpResults(serpResponse, searchParams.q);
      
      // Format and return results
      return this.formatSearchResults(products, searchParams);
    } catch (error) {
      Logger.error("Product search failed", error);
      throw error;
    }
  }

  static async getProductDetails(productId: string) {
    try {
      // Since we're not storing products in DB, this would need to be handled differently
      // For now, we'll return an error indicating this feature needs to be reimplemented
      throw new Error("Product details endpoint needs to be reimplemented for session-based storage");
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

  private static processSerpResults(serpData: any, query: string): ISearchProduct[] {
    const products: ISearchProduct[] = [];
    
    if (serpData.shopping_results) {
      for (const item of serpData.shopping_results) {
        const product: ISearchProduct = {
          id: this.generateProductId(item.title, item.source),
          title: item.title || "unavailable",
          product_id: item.product_id || "",
          product_link: item.product_link || "",
          source: item.source || "Unknown",
          price: item.extracted_price || 0,
          rating: item.rating,
          reviews: item.reviews,
          images: item.thumbnails || [item.thumbnail || ""],
        };

        products.push(product);
      }
    }

    return products;
  }

  private static formatSearchResults(products: ISearchProduct[], searchParams: ProductSearchRequest): ISearchProduct[] {
    let results = products;

    // Apply platform filtering
    if (searchParams.platform) {
      const platformFilter = searchParams.platform.split(',').map(p => p.trim().toLowerCase());
      results = results.filter(product => 
        platformFilter.includes(product.source.toLowerCase())
      );
    }

    // Apply sorting
    if (searchParams.sort === "price_asc") {
      results.sort((a, b) => a.price - b.price);
    } else if (searchParams.sort === "price_desc") {
      results.sort((a, b) => b.price - a.price);
    }

    return results;
  }

  private static extractPrice(priceString: string): number {
    if (!priceString) return 0;
    const match = priceString.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, '')) : 0;
  }

  private static generateProductId(title: string, source: string): string {
    // Generate a unique ID based on title and source
    const idString = `${title}-${source}`;
    return Buffer.from(idString).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
  }
}
