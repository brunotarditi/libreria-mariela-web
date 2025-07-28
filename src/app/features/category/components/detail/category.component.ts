import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CategoryService } from '@features/category/services/category.service';
import { Category } from '../../model/category';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { TitleComponent } from '@shared/components/title/title.component';
import { SnackBarService } from '@shared/services/snackbar.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    TitleComponent
  ],
})
export class CategoryComponent implements OnInit {

  @ViewChild('formDirective') private formDirective: FormGroupDirective | undefined;
  categoryId: string | null = null;
  hasExist: boolean = false;
  id: number = 0;

  private categoryService = inject(CategoryService);
  private formBuilder = inject(FormBuilder);
  private snackBarService = inject(SnackBarService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  categoryForm = this.formBuilder.group({
    categories: this.formBuilder.array([
      this.formBuilder.control('', Validators.required)
    ])
  });

  get categories() {
    return this.categoryForm.get('categories') as FormArray
  }

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.params['id'];
    if (this.categoryId !== 'create') {
      if(this.categoryId){
        this.hasExist = true;
        this.categoryService.getById(+this.categoryId).subscribe({
          next: (res) => {
            this.id = res.ID
            this.categories.controls[0].setValue(res.name)
          },
          error: (err) => this.snackBarService.showSnackBar(`Error al cargar la categoría: ${err}`, 'error-snackbar', 3000, 'end', 'top')
        })
      }
    }
  }

  addField(){
    if (this.categories.length >= 10) {
      this.snackBarService.showSnackBar('Puedes agregar hasta 10 categorías', 'error-snackbar', 3000, 'end', 'top')
      return
    }
    this.categories.push(this.formBuilder.control('', Validators.required))
  }

  deleteField(){
    if (this.categories.length <= 1) {
      this.snackBarService.showSnackBar('Debe haber al menos una categoría', 'error-snackbar', 3000, 'end', 'top')
      return
    }
    this.categories.removeAt(this.categories.length - 1)
  }

  onSubmit(){
    if (this.categories.length === 1) {
      const category: Category = {
          ID: this.id || 0,
          name: this.categories.value[0]
      }
      if (this.id > 0) {
        this.categoryService.update(this.id, category).subscribe({
          next: (res) => {
            this.snackBarService.showSnackBar(`Se actualizó con éxito la categoría ${res.name}`, 'success-snackbar', 3000, 'end', 'top')
          },
          complete: () => {
            this.resetForm();
            this.goBack();
          }
        })
      }else{
        this.categoryService.save(category).subscribe({
          next: (res) => {
            this.snackBarService.showSnackBar(`Se guardó con éxito la categoría ${res.name}`, 'success-snackbar', 3000, 'end', 'top')
          },
          complete: () => {
            this.resetForm();
            this.goBack();
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
          this.snackBarService.showSnackBar(`Se guardaron con éxito las categorías`, 'success-snackbar', 3000, 'end', 'top')
        },
        complete: () => {
          this.resetForm();
          this.goBack();
        }
      })
    }
  }

  resetForm(){
    if (this.formDirective) {
      this.formDirective.resetForm();
    }
    this.categoryForm.reset();
  }

  goBack() {
    this.router.navigate(['/categories']);
  }

}


