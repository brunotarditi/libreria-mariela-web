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
import { MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { TitleComponent } from '@shared/components/title/title.component';
import { SnackBarService } from '@shared/services/snackbar.service';
import { Router } from '@angular/router';

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
    CommonModule,
    TitleComponent
  ],
})
export class CustomersComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'contact_info', 'actions'];
  dataSource: MatTableDataSource<Customer> = new MatTableDataSource<Customer>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  private customerService = inject(CustomerService);
  private snackBarService = inject(SnackBarService);
  private router = inject(Router);

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
    })
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
    this.customerService.deleteById(id).subscribe({
      next: (res: any) => {
        this.snackBarService.showSnackBar(`${res.message}`, 'success-snackbar', 3000, 'end', 'top')
          this.getData()
        },
    })
  }

  goToDetail(){
    this.router.navigate(['/customers/detail/create'])
  }

}


