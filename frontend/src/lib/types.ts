export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  unit_price: number;
  stock_quantity: number;
  is_active: boolean;
}

export interface OrderLine {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: "draft" | "pending_validation" | "confirmed" | "in_preparation" | "shipped" | "cancelled";
  total_amount: number;
  receipt_url?: string;
  receipt_data?: {
    operator?: string;
    transaction_ref?: string;
    amount?: number;
    currency?: string;
    date?: string;
    sender_phone?: string;
  };
  created_at: string;
  lines: OrderLine[];
}

export interface Customer {
  id: string;
  phone_number: string;
  name?: string;
  address?: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  sender: "customer" | "ai_agent" | "human_agent";
  content?: string;
  media_url?: string;
  media_type: "text" | "audio" | "image" | "document";
  created_at: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  customer?: Customer;
  status: "bot" | "human_handover";
  last_activity_at: string;
  messages?: Message[];
}
