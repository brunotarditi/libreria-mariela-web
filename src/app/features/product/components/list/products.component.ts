import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ProductService } from '@features/product/service/product.service';
import { ProductData } from '../../model/product';
import { SnackBarService } from '@shared/services/snackbar.service';
import { CrudTableComponent } from '@shared/components/crud-table/crud-table.component';
import { TableColumn } from '@shared/components/crud-table/crud-table.models';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  standalone: true,
  imports: [CrudTableComponent],
})
export class ProductsComponent implements OnInit {
  products = signal<ProductData[]>([]);
  isLoading = signal<boolean>(true);

  columns: TableColumn<ProductData>[] = [
    { key: 'code', label: 'Código' },
    { key: 'name', label: 'Nombre' },
    { key: 'profit_margin', label: 'Margen de ganancia', format: (row) => `${row.profit_margin} %` },
    { key: 'description', label: 'Descripción' },
    { key: 'brand_name', label: 'Marca' },
    { key: 'category_name', label: 'Categoría' }
  ];

  private productService = inject(ProductService);
  private snackBarService = inject(SnackBarService);

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.productService.getAll().subscribe({
      next: (res) => {
        this.products.set(res);
        this.isLoading.set(false);
      },
    });
  }

  onDelete(product: ProductData): void {
    this.productService.deleteById(product.id).subscribe({
      next: (res: any) => {
        this.snackBarService.showSnackBar(`${res.message}`, 'success-snackbar', 3000, 'end', 'top');
        this.getData();
      },
    });
  }

  onBulkDelete(items: ProductData[]): void {
    this.isLoading.set(true);
    const deleteObservables = items.map(item => this.productService.deleteById(item.id));
    forkJoin(deleteObservables).subscribe({
      next: () => {
        this.snackBarService.showSnackBar(`Se eliminaron ${items.length} productos con éxito`, 'success-snackbar', 3000, 'end', 'top');
        this.getData();
      },
      error: (err) => {
        this.snackBarService.showSnackBar(`Error al eliminar productos: ${err}`, 'error-snackbar', 3000, 'end', 'top');
        this.getData();
      }
    });
  }
}
