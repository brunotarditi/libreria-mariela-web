import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SupplierService } from '@features/supplier/services/supplier.service';
import { Supplier } from '../../model/supplier';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TitleComponent } from '@shared/components/title/title.component';
import { SnackBarService } from '@shared/services/snackbar.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '@shared/components/dialog/warning/dialog-warning.component';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.css',
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
export class SuppliersComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'contact_info', 'actions'];
  dataSource: MatTableDataSource<Supplier> = new MatTableDataSource<Supplier>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  allowed_roles: string[] = ['ROOT', 'ADMIN' ,'WRITE'];

  private supplierService = inject(SupplierService);
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
    this.supplierService.getAll().subscribe({
      next: (res) => {
        this.dataSource = new MatTableDataSource<Supplier>(res)
        this.dataSource.filterPredicate = (data: Supplier, filter: string) => {
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
    this.router.navigate(['/suppliers/detail/' + id])
  }

  onDelete(id: number) {
    const dialogRef = this.dialog.open(DialogWarningComponent, {
      width: '400px',
      data: {
        title: 'Eliminar proveedor',
        message: "¿Estás seguro de eliminar este proveedor?"
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.supplierService.deleteById(id).subscribe({
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
    this.router.navigate(['/suppliers/detail/create'])
  }

}


