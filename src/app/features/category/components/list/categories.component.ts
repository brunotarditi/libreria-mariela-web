import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CategoryService } from '@features/category/services/category.service';
import { Category } from '../../model/category';
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
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
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
export class CategoriesComponent implements OnInit, AfterViewInit {
  isLoading: boolean = true;
  displayedColumns: string[] = ['name', 'actions'];
  dataSource: MatTableDataSource<Category> = new MatTableDataSource<Category>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  allowed_roles: string[] = ['ROOT', 'ADMIN' ,'WRITE'];

  private categoryService = inject(CategoryService);
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
    this.getData()
  }

  onChangePage(){

  }

  getData(){
    this.categoryService.getAll().subscribe({
      next: (res) => {
        this.dataSource = new MatTableDataSource<Category>(res)
        this.dataSource.filterPredicate = (data: Category, filter: string) => {
          return data.name.trim().toLowerCase().indexOf(filter) !== -1
        }
        if (this.dataSource && this.paginator && this.sort) {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
        this.isLoading = false;
      },
    });
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
    this.router.navigate(['/categories/detail/' + id])
  }

  onDelete(id: number) {
    const dialogRef = this.dialog.open(DialogWarningComponent, {
      width: '400px',
      data: {
        title: 'Eliminar categoría',
        message: "¿Estás seguro de eliminar esta categoría?"
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.categoryService.deleteById(id).subscribe({
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
    this.router.navigate(['/categories/detail/create'])
  }

}


