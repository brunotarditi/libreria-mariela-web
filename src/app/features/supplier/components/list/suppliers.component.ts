import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SupplierService } from '@features/supplier/services/supplier.service';
import { Supplier } from '../../model/supplier';
import { SnackBarService } from '@shared/services/snackbar.service';
import { CrudTableComponent } from '@shared/components/crud-table/crud-table.component';
import { TableColumn } from '@shared/components/crud-table/crud-table.models';
import { BreadcrumbComponent, BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  standalone: true,
  imports: [CrudTableComponent, BreadcrumbComponent],
})
export class SuppliersComponent implements OnInit {
  suppliers = signal<Supplier[]>([]);
  isLoading = signal<boolean>(true);

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Contactos' },
    { label: 'Proveedores' }
  ];

  columns: TableColumn<Supplier>[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'contact_info', label: 'Contacto' }
  ];

  private supplierService = inject(SupplierService);
  private snackBarService = inject(SnackBarService);

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.supplierService.getAll().subscribe({
      next: (res) => {
        this.suppliers.set(res);
        this.isLoading.set(false);
      },
    });
  }

  onDelete(supplier: Supplier): void {
    this.supplierService.deleteById(supplier.ID).subscribe({
      next: (res: any) => {
        this.snackBarService.showSnackBar(`${res.message}`, 'success-snackbar', 3000, 'end', 'top');
        this.getData();
      },
    });
  }

  onBulkDelete(items: Supplier[]): void {
    this.isLoading.set(true);
    const deleteObservables = items.map(item => this.supplierService.deleteById(item.ID));
    forkJoin(deleteObservables).subscribe({
      next: () => {
        this.snackBarService.showSnackBar(`Se eliminaron ${items.length} proveedores con éxito`, 'success-snackbar', 3000, 'end', 'top');
        this.getData();
      },
      error: (err) => {
        this.snackBarService.showSnackBar(`Error al eliminar proveedores: ${err}`, 'error-snackbar', 3000, 'end', 'top');
        this.getData();
      }
    });
  }
}
