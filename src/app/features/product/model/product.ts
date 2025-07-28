export interface ProductData {
  id: number
  sku: string
  code: string
  name: string
  profit_margin: number
  description: string
  brand_name: string
  category_name: string
}

export interface Product {
  ID: number
  name: string
  sku: string
  code: string
  profit_margin: number
  description: string
  category_id: number
  brand_id: number
}
