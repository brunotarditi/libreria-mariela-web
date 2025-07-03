import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CategoryService } from '@features/category/services/category.service';
import { Category } from '../model/category';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { TitleComponent } from '@shared/components/title/title.component';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
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
export class CategoryComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'actions'];
  dataSource: MatTableDataSource<Category> = new MatTableDataSource<Category>([]);
  readonly panelOpenState = signal(true);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;
  @ViewChild('formDirective') private formDirective: FormGroupDirective | undefined;

  private categoryService = inject(CategoryService);
  private formBuilder = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);

  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  isUpdate: boolean = false;
  id: number = 0;

  categoryForm = this.formBuilder.group({
    names: this.formBuilder.array([
      this.formBuilder.control('', Validators.required)
    ])
  });

  get categories() {
    return this.categoryForm.get('names') as FormArray
  }


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

  addField(){
    if (this.categories.length >= 10) {
      this.showSnackBar('Puedes agregar hasta 10 marcas', 'error-snackbar')
      return
    }
    this.categories.push(this.formBuilder.control('', Validators.required))
  }

  deleteField(){
    if (this.categories.length <= 1) {
      this.showSnackBar('Debe haber al menos una marca', 'error-snackbar')
      return
    }
    this.categories.removeAt(this.categories.length - 1)
  }

  onSubmit(){
    this.isUpdate = false;
    if (this.categories.length === 1) {
      if (this.id > 0) {
        const category: Category = {
          ID: this.id,
          name: this.categories.value[0]
        }

        this.categoryService.update(this.id, category).subscribe({
          next: (res) => {
            this.showSnackBar(`Se actualizó con éxito la marca ${res.name}`, 'success-snackbar')
          },
          error: (err) => {
            this.showSnackBar(`Ha ocurrido el siguiente error: ${err.error.error}`, 'error-snackbar')
          },
          complete: () => {
            this.getData()
            this.resetForm()
          }
        })
      }else{
        const category: Category = {
          ID: 0,
          name: this.categories.value[0]
        }

        this.categoryService.save(category).subscribe({
          next: (res) => {
            this.showSnackBar(`Se guardó con éxito la marca ${res.name}`, 'success-snackbar')
          },
          error: (err) => {
            this.showSnackBar(`Ha ocurrido el siguiente error: ${err.error.error}`, 'error-snackbar')
          },
          complete: () => {
            this.getData()
            this.resetForm()
          }
        })
      }

    }else{
      let categories: Category[] = []

      this.categories.value.forEach((item: string) => {
        categories.push({ID: 0, name: item})
      });

      this.categoryService.saveMany(categories).subscribe({
        next: () => {
          this.showSnackBar(`Se guardaron con éxito las marcas`, 'success-snackbar')
        },
        error: (err) => {
          this.showSnackBar(`Ha ocurrido el siguiente error: ${err.error.error}`, 'error-snackbar')
        },
        complete: () => {
          this.getData()
          this.resetForm()
        }
      })
    }
  }

  onUpdate(id: number) {
    this.isUpdate = true;
    this.categoryService.getById(id).subscribe({
      next: (res) => {
        this.id = res.ID
        this.categories.controls[0].setValue(res.name)
      }
    })
  }

  onDelete(id: number) {
    this.categoryService.deleteById(id).subscribe({
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

  resetForm(){
    if (this.formDirective) {
      this.formDirective.resetForm();
    }
    this.categoryForm.reset();
  }

}


