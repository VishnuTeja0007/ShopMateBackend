import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Circle, ExternalLink, Info, AlertTriangle } from "lucide-react";
import ApiSidebar from "@/components/api-sidebar";
import ApiEndpoint from "@/components/api-endpoint";

const endpoints = [
  {
    id: "register",
    method: "POST",
    path: "/api/auth/register",
    title: "Register User",
    description: "Register a new user account in the ShopMate system.",
    parameters: [
      { name: "email", type: "string", required: true, description: "User's email address" },
      { name: "password", type: "string", required: true, description: "User's password (min 8 characters)" },
    ],
    requestBody: `{
  "email": "user@example.com",
  "password": "securePassword123"
}`,
    responseExample: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com"
}`,
  },
  {
    id: "login",
    method: "POST",
    path: "/api/auth/login",
    title: "Login User",
    description: "Authenticate an existing user and receive a JWT token.",
    parameters: [
      { name: "email", type: "string", required: true, description: "User's email address" },
      { name: "password", type: "string", required: true, description: "User's password" },
    ],
    requestBody: `{
  "email": "user@example.com",
  "password": "securePassword123"
}`,
    responseExample: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com"
}`,
  },
  {
    id: "profile",
    method: "GET",
    path: "/api/auth/me",
    title: "Get Profile",
    description: "Get the authenticated user's profile information.",
    isProtected: true,
    responseExample: `{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "preferences": {
    "theme": "light"
  }
}`,
  },
  {
    id: "search-products",
    method: "GET",
    path: "/api/products/search",
    title: "Search Products",
    description: "Search for products across various e-commerce platforms using Google Shopping Engine.",
    parameters: [
      { name: "q", type: "string", required: true, description: "Search query (e.g., 'smartphone', 'laptop')" },
      { name: "sort", type: "string", required: false, description: "Sort order: 'price_asc' or 'price_desc'" },
      { name: "platform", type: "string", required: false, description: "Filter by platforms: 'amazon,flipkart,myntra'" },
    ],
    responseExample: `[
  {
    "id": "prod_123",
    "name": "iPhone 15 Pro",
    "imageUrl": "https://example.com/image.jpg",
    "lowestPrice": 99999,
    "bestValue": true,
    "platforms": [
      {
        "name": "Amazon",
        "logoUrl": "https://example.com/amazon.png",
        "price": 99999,
        "discount": 5000,
        "inclusivePrice": 102999,
        "deliveryDate": "2024-01-15",
        "productUrl": "https://amazon.com/...",
        "sellerRating": 4.5
      }
    ],
    "priceHistory": [
      {
        "date": "2024-01-01",
        "price": 104999
      }
    ]
  }
]`,
  },
  {
    id: "get-product",
    method: "GET",
    path: "/api/products/:id",
    title: "Get Product Details",
    description: "Get detailed information and insights for a specific product.",
    parameters: [
      { name: "id", type: "string", required: true, description: "Product ID" },
    ],
    responseExample: `{
  "id": "prod_123",
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with advanced features",
  "imageUrls": ["https://example.com/image.jpg"],
  "platforms": [
    {
      "name": "Amazon",
      "logoUrl": "https://example.com/amazon.png",
      "price": 99999,
      "discount": 5000,
      "inclusivePrice": 102999,
      "deliveryDate": "2024-01-15",
      "productUrl": "https://amazon.com/...",
      "sellerRating": 4.5
    }
  ],
  "priceHistory": [
    {
      "date": "2024-01-01",
      "price": 104999
    }
  ],
  "overallRating": 4.5,
  "reviewCount": 1250,
  "lastPriceChangeAt": "2024-01-10T10:30:00Z"
}`,
  },
  {
    id: "get-wishlist",
    method: "GET",
    path: "/api/wishlist",
    title: "Get Wishlist",
    description: "Retrieve the authenticated user's wishlist with current pricing information.",
    isProtected: true,
    responseExample: `[
  {
    "productId": "prod_123",
    "name": "iPhone 15 Pro",
    "imageUrl": "https://example.com/image.jpg",
    "currentLowestPrice": 99999,
    "targetPrice": 95000,
    "platforms": [
      {
        "name": "Amazon",
        "price": 99999,
        "productUrl": "https://amazon.com/..."
      }
    ]
  }
]`,
  },
  {
    id: "add-to-wishlist",
    method: "POST",
    path: "/api/wishlist",
    title: "Add to Wishlist",
    description: "Add a product to the user's wishlist.",
    isProtected: true,
    parameters: [
      { name: "productId", type: "string", required: true, description: "Product ID to add" },
      { name: "productUrl", type: "string", required: true, description: "Product URL" },
      { name: "platform", type: "string", required: true, description: "Platform name" },
    ],
    requestBody: `{
  "productId": "prod_123",
  "productUrl": "https://amazon.com/product/123",
  "platform": "Amazon"
}`,
    responseExample: `{
  "message": "Product added to wishlist."
}`,
  },
  {
    id: "remove-from-wishlist",
    method: "DELETE",
    path: "/api/wishlist/:productId",
    title: "Remove from Wishlist",
    description: "Remove a product from the user's wishlist.",
    isProtected: true,
    parameters: [
      { name: "productId", type: "string", required: true, description: "Product ID to remove" },
    ],
    responseExample: `{
  "message": "Product removed from wishlist."
}`,
  },
  {
    id: "get-orders",
    method: "GET",
    path: "/api/orders",
    title: "Get Orders",
    description: "Get the authenticated user's tracked orders.",
    isProtected: true,
    responseExample: `[
  {
    "id": "order_123",
    "orderId": "AMZ123456789",
    "productName": "iPhone 15 Pro",
    "platform": "Amazon",
    "purchaseDate": "2024-01-01",
    "status": "Shipped",
    "orderUrl": "https://amazon.com/order/123"
  }
]`,
  },
  {
    id: "add-order",
    method: "POST",
    path: "/api/orders",
    title: "Add Order",
    description: "Add a new order to track (manual entry).",
    isProtected: true,
    parameters: [
      { name: "orderId", type: "string", required: true, description: "Order ID from platform" },
      { name: "productName", type: "string", required: true, description: "Product name" },
      { name: "platform", type: "string", required: true, description: "Platform name" },
      { name: "purchaseDate", type: "string", required: true, description: "Purchase date" },
      { name: "orderUrl", type: "string", required: true, description: "Order tracking URL" },
    ],
    requestBody: `{
  "orderId": "AMZ123456789",
  "productName": "iPhone 15 Pro",
  "platform": "Amazon",
  "purchaseDate": "2024-01-01",
  "orderUrl": "https://amazon.com/order/123"
}`,
    responseExample: `{
  "message": "Order added for tracking.",
  "order": {
    "id": "order_123",
    "orderId": "AMZ123456789",
    "productName": "iPhone 15 Pro",
    "platform": "Amazon",
    "purchaseDate": "2024-01-01",
    "status": "Pending",
    "orderUrl": "https://amazon.com/order/123"
  }
}`,
  },
  {
    id: "update-order-status",
    method: "PUT",
    path: "/api/orders/:orderId/refresh-status",
    title: "Update Order Status",
    description: "Manually trigger an update of a tracked order's status.",
    isProtected: true,
    parameters: [
      { name: "orderId", type: "string", required: true, description: "Order ID to update" },
    ],
    responseExample: `{
  "message": "Order status updated.",
  "newStatus": "Delivered"
}`,
    notes: "This endpoint scrapes the order URL to fetch the latest status when explicitly triggered by user action.",
  },
  {
    id: "search-history",
    method: "GET",
    path: "/api/search/history",
    title: "Search History",
    description: "Retrieve a user's (or session's) search history.",
    responseExample: `[
  {
    "query": "iPhone 15",
    "timestamp": "2024-01-15T10:30:00Z",
    "productId": "prod_123",
    "productName": "iPhone 15 Pro"
  }
]`,
  },
  {
    id: "daily-deals",
    method: "GET",
    path: "/api/deals",
    title: "Daily Deals",
    description: "Get daily deals from various e-commerce platforms. Data is scraped when users click 'Update Today's Deals'.",
    responseExample: `[
  {
    "id": "deal_123",
    "name": "Samsung Galaxy S24",
    "imageUrl": "https://example.com/samsung.jpg",
    "originalPrice": 79999,
    "dealPrice": 59999,
    "discountPercentage": 25,
    "platform": "Amazon",
    "productUrl": "https://amazon.com/...",
    "scrapedAt": "2024-01-15T10:30:00Z"
  }
]`,
    notes: "This endpoint initiates web scraping only when explicitly requested by user action.",
  },
];

export default function ApiDocs() {
  const [activeSection, setActiveSection] = useState("introduction");

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let currentSection = "";

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          currentSection = section.id;
        }
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <ApiSidebar onSectionClick={handleSectionClick} activeSection={activeSection} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">ShopMate API Documentation</h1>
            <p className="text-lg text-slate-600">
              Complete REST API for product search, comparison, and shopping management across multiple e-commerce platforms.
            </p>
            
            <div className="mt-6 flex items-center space-x-4">
              <Badge className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle size={16} className="mr-2 text-green-400" />
                API Status: Online
              </Badge>
              <Badge className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Version: 1.0.0
              </Badge>
            </div>
          </div>

          {/* Introduction */}
          <section id="introduction" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Introduction</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-slate-600 mb-4">
                  The ShopMate API provides comprehensive functionality for building shopping applications with product search, 
                  comparison, wishlist management, and order tracking capabilities across multiple e-commerce platforms.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Base URL</h3>
                    <code className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      https://api.shopmate.com/api
                    </code>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Content Type</h3>
                    <code className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      application/json
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Authentication */}
          <section id="authentication" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Authentication</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-slate-600 mb-4">
                  ShopMate API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header for protected endpoints.
                </p>
                
                <div className="bg-slate-900 rounded-lg p-4 mb-4">
                  <code className="text-green-400 font-mono text-sm">
                    Authorization: Bearer &lt;your-jwt-token&gt;
                  </code>
                </div>
                
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Protected endpoints</strong> require authentication. You'll receive a 401 Unauthorized error if the token is missing or invalid.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </section>

          {/* Error Handling */}
          <section id="errors" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Error Handling</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-slate-600 mb-6">ShopMate API uses standard HTTP status codes to indicate success or failure of requests.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Status Codes</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Badge className="text-xs bg-green-100 text-green-800 font-mono">200</Badge>
                        <span className="text-sm text-slate-600">OK - Request successful</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="text-xs bg-green-100 text-green-800 font-mono">201</Badge>
                        <span className="text-sm text-slate-600">Created - Resource created</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="text-xs bg-red-100 text-red-800 font-mono">400</Badge>
                        <span className="text-sm text-slate-600">Bad Request - Invalid parameters</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="text-xs bg-red-100 text-red-800 font-mono">401</Badge>
                        <span className="text-sm text-slate-600">Unauthorized - Authentication required</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="text-xs bg-red-100 text-red-800 font-mono">404</Badge>
                        <span className="text-sm text-slate-600">Not Found - Resource not found</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="text-xs bg-red-100 text-red-800 font-mono">500</Badge>
                        <span className="text-sm text-slate-600">Internal Server Error</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Error Response Format</h3>
                    <div className="bg-slate-900 rounded-lg p-4">
                      <pre className="text-sm text-slate-300 font-mono">
                        <code>{`{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Email is required",
    "details": {
      "field": "email",
      "reason": "missing_required_field"
    }
  }
}`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* API Endpoints */}
          {endpoints.map((endpoint) => (
            <section key={endpoint.id} id={endpoint.id}>
              <ApiEndpoint
                method={endpoint.method}
                path={endpoint.path}
                title={endpoint.title}
                description={endpoint.description}
                isProtected={endpoint.isProtected}
                parameters={endpoint.parameters}
                requestBody={endpoint.requestBody}
                responseExample={endpoint.responseExample}
                notes={endpoint.notes}
              />
            </section>
          ))}

          {/* Rate Limiting */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Rate Limiting</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-slate-600 mb-6">API requests are rate-limited to ensure fair usage and system stability.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Search Endpoints</h3>
                    <p className="text-2xl font-bold text-blue-600">100</p>
                    <p className="text-sm text-slate-600">requests per minute</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Authentication</h3>
                    <p className="text-2xl font-bold text-blue-600">20</p>
                    <p className="text-sm text-slate-600">requests per minute</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Other Endpoints</h3>
                    <p className="text-2xl font-bold text-blue-600">200</p>
                    <p className="text-sm text-slate-600">requests per minute</p>
                  </div>
                </div>
                
                <Alert className="mt-6 bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    When rate limits are exceeded, the API returns a <code className="bg-amber-100 px-1 rounded">429 Too Many Requests</code> status code.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </section>

          {/* SDKs & Libraries */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">SDKs & Libraries</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-slate-600 mb-6">Official SDKs and community libraries for easy integration with ShopMate API.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-600 font-bold text-sm">JS</span>
                      </div>
                      <h3 className="font-semibold text-slate-900">JavaScript</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Official Node.js SDK</p>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">npm install shopmate-js</code>
                  </div>
                  
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">PY</span>
                      </div>
                      <h3 className="font-semibold text-slate-900">Python</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Official Python SDK</p>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">pip install shopmate-python</code>
                  </div>
                  
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <span className="text-cyan-600 font-bold text-sm">⚛</span>
                      </div>
                      <h3 className="font-semibold text-slate-900">React</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">React hooks library</p>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">npm install @shopmate/react</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
