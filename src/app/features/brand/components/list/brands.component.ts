import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BrandService } from '@features/brand/services/brand.service';
import { Brand } from '../../model/brand';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TitleComponent } from '@shared/components/title/title.component';
import { SnackBarService } from '@shared/services/snackbar.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '@shared/components/dialog/warning/dialog-warning.component';
import { AuthService } from '@core/services/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CommonModule,
    TitleComponent
  ],
})
export class BrandsComponent implements OnInit, AfterViewInit {
  isLoading: boolean = true;
  displayedColumns: string[] = ['name', 'actions'];
  dataSource: MatTableDataSource<Brand> = new MatTableDataSource<Brand>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  allowed_roles: string[] = ['ROOT', 'ADMIN' ,'WRITE'];

  private brandService = inject(BrandService);
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
      this.brandService.getAll().subscribe({
        next: (res) => {
          this.dataSource = new MatTableDataSource<Brand>(res)
          this.dataSource.filterPredicate = (data: Brand, filter: string) => {
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
    this.router.navigate(['/brands/detail/' + id])
  }

  onDelete(id: number) {
    const dialogRef = this.dialog.open(DialogWarningComponent, {
      width: '400px',
      data: {
        title: 'Eliminar marca',
        message: "¿Estás seguro de eliminar esta marca?"
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.brandService.deleteById(id).subscribe({
          next: (res: any) => {
            this.snackBarService.showSnackBar(`${res.message}`, 'success-snackbar', 3000, 'end', 'top')
              this.getData()
            },
        })
      }
    });
  }

  permission(){
    const userRoles = this.authService.roles;
    return this.allowed_roles.some(role => userRoles.includes(role));
  }

  goToDetail(){
    this.router.navigate(['/brands/detail/create'])
  }

}


