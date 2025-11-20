import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Buyer {
  buyer_id: string;
  buyer_name: string;
  birthday: string;
  created_at?: string;
}

export interface Product {
  product_id: string;
  product_name: string;
  description: string;
  price: number;
  created_at?: string;
}

export interface Order {
  order_id: string;
  buyer_id: string;
  order_number: string;
  order_date: string;
  order_summa: number;
  created_at?: string;
}

export interface OrderProduct {
  order_id: string;
  product_id: string;
  created_at?: string;
}
