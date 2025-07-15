import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart } from "lucide-react";

interface SidebarProps {
  onSectionClick: (sectionId: string) => void;
  activeSection: string;
}

const apiSections = [
  {
    title: "Getting Started",
    items: [
      { id: "introduction", title: "Introduction", method: "" },
      { id: "authentication", title: "Authentication", method: "" },
      { id: "errors", title: "Error Handling", method: "" },
    ]
  },
  {
    title: "Authentication",
    items: [
      { id: "register", title: "Register User", method: "POST" },
      { id: "login", title: "Login User", method: "POST" },
      { id: "profile", title: "Get Profile", method: "GET" },
    ]
  },
  {
    title: "Products",
    items: [
      { id: "search-products", title: "Search Products", method: "GET" },
      { id: "get-product", title: "Get Product Details", method: "GET" },
    ]
  },
  {
    title: "Wishlist",
    items: [
      { id: "get-wishlist", title: "Get Wishlist", method: "GET" },
      { id: "add-to-wishlist", title: "Add to Wishlist", method: "POST" },
      { id: "remove-from-wishlist", title: "Remove from Wishlist", method: "DELETE" },
    ]
  },
  {
    title: "Orders",
    items: [
      { id: "get-orders", title: "Get Orders", method: "GET" },
      { id: "add-order", title: "Add Order", method: "POST" },
      { id: "update-order-status", title: "Update Order Status", method: "PUT" },
    ]
  },
  {
    title: "Search & Deals",
    items: [
      { id: "search-history", title: "Search History", method: "GET" },
      { id: "daily-deals", title: "Daily Deals", method: "GET" },
    ]
  },
];

const methodColors = {
  GET: "bg-blue-100 text-blue-800",
  POST: "bg-green-100 text-green-800",
  PUT: "bg-yellow-100 text-yellow-800",
  DELETE: "bg-red-100 text-red-800",
};

export default function ApiSidebar({ onSectionClick, activeSection }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = apiSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <nav className="w-80 bg-white border-r border-slate-200 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <ShoppingCart className="text-white" size={16} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">ShopMate API</h1>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <Input
            type="text"
            placeholder="Search endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2">
          {filteredSections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onSectionClick(item.id)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                        activeSection === item.id
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{item.title}</span>
                      {item.method && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${methodColors[item.method as keyof typeof methodColors]}`}
                        >
                          {item.method}
                        </Badge>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
