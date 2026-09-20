import { Component, inject, OnInit, signal } from '@angular/core';
import { CustomerService } from '@features/customer/services/customer.service';
import { Customer } from '../../model/customer';
import { SnackBarService } from '@shared/services/snackbar.service';
import { CrudTableComponent } from '@shared/components/crud-table/crud-table.component';
import { TableColumn } from '@shared/components/crud-table/crud-table.models';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  standalone: true,
  imports: [CrudTableComponent],
})
export class CustomersComponent implements OnInit {
  customers = signal<Customer[]>([]);
  isLoading = signal<boolean>(true);

  columns: TableColumn<Customer>[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'contact_info', label: 'Contacto' }
  ];

  private customerService = inject(CustomerService);
  private snackBarService = inject(SnackBarService);

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.customerService.getAll().subscribe({
      next: (res) => {
        this.customers.set(res);
        this.isLoading.set(false);
      },
    });
  }

  onDelete(customer: Customer): void {
    this.customerService.deleteById(customer.ID).subscribe({
      next: (res: any) => {
        this.snackBarService.showSnackBar(`${res.message}`, 'success-snackbar', 3000, 'end', 'top');
        this.getData();
      },
    });
  }
}
