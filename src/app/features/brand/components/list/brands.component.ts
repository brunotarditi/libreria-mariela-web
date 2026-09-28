import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { BrandService } from '@features/brand/services/brand.service';
import { Brand } from '../../model/brand';
import { SnackBarService } from '@shared/services/snackbar.service';
import { CrudTableComponent } from '@shared/components/crud-table/crud-table.component';
import { TableColumn } from '@shared/components/crud-table/crud-table.models';
import { BreadcrumbComponent, BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  standalone: true,
  imports: [CrudTableComponent, BreadcrumbComponent],
})
export class BrandsComponent implements OnInit {
  brands = signal<Brand[]>([]);
  isLoading = signal<boolean>(true);

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Catálogo' },
    { label: 'Marcas' }
  ];

  columns: TableColumn<Brand>[] = [
    { key: 'name', label: 'Nombre' }
  ];

  private brandService = inject(BrandService);
  private snackBarService = inject(SnackBarService);

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.brandService.getAll().subscribe({
      next: (res) => {
        this.brands.set(res);
        this.isLoading.set(false);
      },
    });
  }

  onDelete(brand: Brand): void {
    this.brandService.deleteById(brand.ID).subscribe({
      next: (res: any) => {
        this.snackBarService.showSnackBar(`${res.message}`, 'success-snackbar', 3000, 'end', 'top');
        this.getData();
      },
    });
  }

  onBulkDelete(items: Brand[]): void {
    this.isLoading.set(true);
    const ids = items.map(item => item.ID);
    this.brandService.bulkDelete(ids).subscribe({
      next: (res) => {
        this.snackBarService.showSnackBar(res.message || `Se eliminaron ${res.deleted_count} marcas con éxito`, 'success-snackbar', 3000, 'end', 'top');
        this.getData();
      },
      error: (err) => {
        this.snackBarService.showSnackBar(`Error al eliminar marcas: ${err?.error?.message || err?.message || 'Error del servidor'}`, 'error-snackbar', 3000, 'end', 'top');
        this.getData();
      }
    });
  }
}
