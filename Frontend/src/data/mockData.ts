import { AuctionData } from "@/components/auction/AuctionCard";
import { ProductData } from "@/components/product/ProductCard";

// Generate end times relative to now
const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000);
const minutesFromNow = (minutes: number) => new Date(Date.now() + minutes * 60 * 1000);

export const liveAuctions: AuctionData[] = [
  {
    id: "1",
    title: "Vintage Rolex Submariner 1968",
    image: "https://images.unsplash.com/photo-1587836374828-a58e06cc6b8e?w=600&h=600&fit=crop",
    currentBid: 12500,
    totalBids: 34,
    endTime: minutesFromNow(45),
    isLive: true,
  },
  {
    id: "2",
    title: "Original Abstract Oil Painting",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=600&fit=crop",
    currentBid: 3200,
    totalBids: 18,
    endTime: hoursFromNow(2),
    isLive: true,
  },
  {
    id: "3",
    title: "Limited Edition Sneakers",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&h=600&fit=crop",
    currentBid: 890,
    totalBids: 56,
    endTime: hoursFromNow(4),
    isLive: true,
  },
  {
    id: "4",
    title: "Antique Persian Rug 19th Century",
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&h=600&fit=crop",
    currentBid: 4800,
    totalBids: 12,
    endTime: hoursFromNow(8),
    isLive: true,
  },
  {
    id: "5",
    title: "Rare First Edition Book Collection",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop",
    currentBid: 2100,
    totalBids: 23,
    endTime: hoursFromNow(12),
    isLive: true,
  },
  {
    id: "6",
    title: "Vintage Gibson Les Paul 1959",
    image: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=600&h=600&fit=crop",
    currentBid: 28000,
    totalBids: 41,
    endTime: hoursFromNow(24),
    isLive: true,
  },
];

export const endingSoonAuctions: AuctionData[] = [
  {
    id: "7",
    title: "Diamond Tennis Bracelet",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop",
    currentBid: 5600,
    totalBids: 28,
    endTime: minutesFromNow(15),
    isLive: true,
  },
  {
    id: "8",
    title: "Vintage Camera Leica M3",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop",
    currentBid: 2300,
    totalBids: 19,
    endTime: minutesFromNow(30),
    isLive: true,
  },
  {
    id: "9",
    title: "Signed Basketball Memorabilia",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=600&fit=crop",
    currentBid: 1100,
    totalBids: 44,
    endTime: minutesFromNow(45),
    isLive: true,
  },
];

export const featuredProducts: ProductData[] = [
  {
    id: "p1",
    title: "Premium Leather Messenger Bag",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop",
    price: 249,
    originalPrice: 349,
    category: "Accessories",
  },
  {
    id: "p2",
    title: "Wireless Noise-Canceling Headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    price: 329,
    category: "Electronics",
  },
  {
    id: "p3",
    title: "Minimalist Ceramic Watch",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    price: 189,
    originalPrice: 220,
    category: "Watches",
  },
  {
    id: "p4",
    title: "Handcrafted Wooden Desk Organizer",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop",
    price: 79,
    category: "Home",
  },
  {
    id: "p5",
    title: "Vintage Polaroid Camera",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop",
    price: 159,
    category: "Electronics",
  },
  {
    id: "p6",
    title: "Artisan Coffee Maker Set",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop",
    price: 129,
    originalPrice: 159,
    category: "Kitchen",
  },
  {
    id: "p7",
    title: "Premium Sunglasses",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
    price: 199,
    category: "Accessories",
  },
  {
    id: "p8",
    title: "Mechanical Keyboard Pro",
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&h=600&fit=crop",
    price: 149,
    category: "Electronics",
  },
];

export const allAuctions: AuctionData[] = [
  ...liveAuctions,
  ...endingSoonAuctions,
  {
    id: "10",
    title: "Classic Muscle Car 1969 Mustang",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=600&fit=crop",
    currentBid: 45000,
    totalBids: 67,
    endTime: hoursFromNow(48),
    isLive: true,
  },
  {
    id: "11",
    title: "Contemporary Sculpture",
    image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600&h=600&fit=crop",
    currentBid: 8500,
    totalBids: 21,
    endTime: hoursFromNow(36),
    isLive: true,
  },
  {
    id: "12",
    title: "Rare Wine Collection 12 Bottles",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=600&fit=crop",
    currentBid: 3400,
    totalBids: 15,
    endTime: hoursFromNow(72),
    isLive: true,
  },
];

export const categories = [
  "All",
  "Art",
  "Watches",
  "Jewelry",
  "Electronics",
  "Collectibles",
  "Fashion",
  "Vehicles",
  "Home",
];

export const productCategories = [
  "All",
  "Electronics",
  "Accessories",
  "Watches",
  "Home",
  "Kitchen",
  "Fashion",
];
