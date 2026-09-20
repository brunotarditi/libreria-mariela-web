export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  format?: (row: T) => string | number;
}
