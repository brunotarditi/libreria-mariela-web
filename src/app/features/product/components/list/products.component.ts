import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ProductService } from '@features/product/service/product.service';
import { Product } from '../../model/product';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { TitleComponent } from '@shared/components/title/title.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    MatExpansionModule,
    TitleComponent
  ],
})
export class ProductsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['code', 'name', 'profit_margin', 'description', 'brand_name', 'category_name', 'actions'];
  dataSource: MatTableDataSource<Product> = new MatTableDataSource<Product>([]);
  readonly panelOpenState = signal(true);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  private productService = inject(ProductService);
  private _snackBar = inject(MatSnackBar);

  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  isUpdate: boolean = false;
  id: number = 0;


  ngAfterViewInit() {
    if(this.dataSource && this.paginator && this.sort){
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngOnInit(): void {
    this.getData()
  }

  getData(){
    this.productService.getAll().subscribe({
      next: (res) => {
        console.log(res);
        this.dataSource = new MatTableDataSource<Product>(res)
        this.dataSource.filterPredicate = (data: Product, filter: string) => {
          return data.name.trim().toLowerCase().indexOf(filter) !== -1
        }
        if (this.dataSource && this.paginator && this.sort) {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      },
      error: (err) => console.error(err)
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


  onDelete(id: number) {
    this.productService.deleteById(id).subscribe({
      next: (res: any) => {
        this.showSnackBar(`${res.message}`, 'success-snackbar')
          this.getData()
        },
        error: (err) => {
          this.showSnackBar(`Ha ocurrido el siguiente error: ${err.error.error}`, 'error-snackbar')
        },
    })
  }

  showSnackBar(message: string, panelClass: string){
    return this._snackBar.open(message, 'Cerrar', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 3000,
            panelClass: [panelClass]
          });
  }

}


