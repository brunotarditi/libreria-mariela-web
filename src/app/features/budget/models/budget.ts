export interface BudgetItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal?: number;
}

export interface Budget {
  id: number;
  ID?: number;
  client_name: string;
  description?: string;
  items?: BudgetItem[];
  items_count?: number;
  total?: number;
  created_at?: string;
  CreatedAt?: string;
}

export interface CreateBudgetRequest {
  client_name: string;
  description: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}
