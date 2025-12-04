// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  role?: 'TOURIST';
  createdAt: string;
  profile?: Profile;
}
export interface Profile {
  id: string;
  userId: string;
  name?: string;
  gender?: string;
  phone?: string;
  country?: string;
  avatar?: string;
  locale?: string;
  dateOfBirth?: string;
  bio?: string;
} 

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  deliveryTime: string;
  isFeatured: boolean;
  isOpen: boolean;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  serviceCount: number;
}

// Cart Types
export interface CartItem {
  id: string;
  service: Service;
  quantity: number;
  specialInstructions?: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  restaurant: Service | null;
  deliveryFee: number;
  serviceFee: number;
}

// Order Types
export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryAddress: string;
  estimatedDelivery: string;
  restaurant: Service;
  trackingNumber: string;
}

export interface OrderItem {
  id: string;
  service: Service;
  quantity: number;
  price: number;
}

// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: User;
  images: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  tags: string[];
  createdAt: string;
  category: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  likes: number;
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
}