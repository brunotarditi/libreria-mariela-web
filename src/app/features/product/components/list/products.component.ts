import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ProductService } from '@features/product/service/product.service';
import { ProductData } from '../../model/product';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { TitleComponent } from '@shared/components/title/title.component';
import { Router } from '@angular/router';
import { SnackBarService } from '@shared/services/snackbar.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  standalone: true,
  imports: [
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    TitleComponent,
  ],
})
export class ProductsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['code', 'name', 'profit_margin', 'description', 'brand_name', 'category_name', 'actions'];
  dataSource: MatTableDataSource<ProductData> = new MatTableDataSource<ProductData>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  private productService = inject(ProductService);
  private snackBarService = inject(SnackBarService);
  private router = inject(Router)

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
        this.dataSource = new MatTableDataSource<ProductData>(res)
        this.dataSource.filterPredicate = (data: ProductData, filter: string) => {
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

  onUpdate(id: number){
    this.router.navigate(['/products/detail/' + id])
  }

  onDelete(id: number) {
    this.productService.deleteById(id).subscribe({
      next: (res: any) => {
        this.snackBarService.showSnackBar(`${res.message}`, 'success-snackbar', 3000, 'end', 'top')
          this.getData()
        },
    })
  }

  goToDetail(){
    this.router.navigate(['/products/detail/create'])
  }

}


