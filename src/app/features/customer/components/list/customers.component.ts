import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CustomerService } from '@features/customer/services/customer.service';
import { Customer } from '../../model/customer';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TitleComponent } from '@shared/components/title/title.component';
import { SnackBarService } from '@shared/services/snackbar.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '@shared/components/dialog/warning/dialog-warning.component';
import { AuthService } from '@core/services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CommonModule,
    TitleComponent
  ],
})
export class CustomersComponent implements OnInit, AfterViewInit {
  isLoading: boolean = true;
  displayedColumns: string[] = ['name', 'contact_info', 'actions'];
  dataSource: MatTableDataSource<Customer> = new MatTableDataSource<Customer>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  allowed_roles: string[] = ['ROOT', 'ADMIN' ,'WRITE'];

  private customerService = inject(CustomerService);
  private authService = inject(AuthService);
  private snackBarService = inject(SnackBarService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  ngAfterViewInit() {
    if(this.dataSource && this.paginator && this.sort){
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngOnInit(): void {
    this.getData();
  }

  getData(){
    this.customerService.getAll().subscribe({
      next: (res) => {
        this.dataSource = new MatTableDataSource<Customer>(res)
        this.dataSource.filterPredicate = (data: Customer, filter: string) => {
          return data.name.trim().toLowerCase().indexOf(filter) !== -1
        }
        if (this.dataSource && this.paginator && this.sort) {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      },
    });
    this.isLoading = false;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if(this.dataSource && this.paginator && this.sort){
      this.dataSource.filter = filterValue.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }


  onUpdate(id: number) {
    this.router.navigate(['/customers/detail/' + id])
  }

  onDelete(id: number) {
    const dialogRef = this.dialog.open(DialogWarningComponent, {
      width: '400px',
      data: {
        title: 'Eliminar cliente',
        message: "¿Estás seguro de eliminar este cliente?"
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.customerService.deleteById(id).subscribe({
          next: (res: any) => {
            this.snackBarService.showSnackBar(`${res.message}`, 'success-snackbar', 3000, 'end', 'top')
              this.getData()
            },
        })
      }
    })
  }

  permission(){
    const userRoles = this.authService.roles;
    return this.allowed_roles.some(role => userRoles.includes(role));
  }

  goToDetail(){
    this.router.navigate(['/customers/detail/create'])
  }

}


