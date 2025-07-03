export interface Dashboard {
  total_products: number
  total_suppliers: number
  total_clients: number
  recent_activities: AuditLog[]
}

interface AuditLog{
  user_name: string
  entity: string
  action: string
  request_at: Date
}

