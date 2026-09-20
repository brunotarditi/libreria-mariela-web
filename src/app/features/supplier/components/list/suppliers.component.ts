import { Component, inject, OnInit, signal } from '@angular/core';
import { SupplierService } from '@features/supplier/services/supplier.service';
import { Supplier } from '../../model/supplier';
import { SnackBarService } from '@shared/services/snackbar.service';
import { CrudTableComponent } from '@shared/components/crud-table/crud-table.component';
import { TableColumn } from '@shared/components/crud-table/crud-table.models';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  standalone: true,
  imports: [CrudTableComponent],
})
export class SuppliersComponent implements OnInit {
  suppliers = signal<Supplier[]>([]);
  isLoading = signal<boolean>(true);

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
}
