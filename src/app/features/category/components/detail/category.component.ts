import { Component, inject, OnInit, ViewChild, signal, HostListener } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CategoryService } from '@features/category/services/category.service';
import { Category } from '../../model/category';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TitleComponent } from '@shared/components/title/title.component';
import { SnackBarService } from '@shared/services/snackbar.service';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { BreadcrumbComponent, BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb.component';
import { DialogWarningComponent } from '@shared/components/dialog/warning/dialog-warning.component';
import { ComponentCanDeactivate } from '@core/guards/pending-changes.guard';

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
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveFormsModule,
    CommonModule,
    TitleComponent,
    BreadcrumbComponent,
  ],
})
export class CategoryComponent implements OnInit, ComponentCanDeactivate {

  @ViewChild('formDirective') private formDirective: FormGroupDirective | undefined;
  categoryId: string | null = null;
  hasExist: boolean = false;
  id: number = 0;
  isSubmitting = signal<boolean>(false);

  private categoryService = inject(CategoryService);
  private formBuilder = inject(FormBuilder);
  private snackBarService = inject(SnackBarService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

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

  deleteField(index: number = this.categories.length - 1){
    if (this.categories.length <= 1) {
      this.snackBarService.showSnackBar('Debe haber al menos una categoría', 'error-snackbar', 3000, 'end', 'top')
      return
    }
    this.categories.removeAt(index);
  }

  onSubmit(){
    if (this.categoryForm.invalid || this.isSubmitting()) {
      return;
    }
    this.isSubmitting.set(true);

    if (this.categories.length === 1) {
      const category: Category = {
          ID: this.id || 0,
          name: this.categories.value[0]
      };
      if (this.id > 0) {
        this.categoryService.update(this.id, category).subscribe({
          next: (res) => {
            this.snackBarService.showSnackBar(`Se actualizó con éxito la categoría ${res.name}`, 'success-snackbar', 3000, 'end', 'top');
          },
          error: (err) => {
            this.isSubmitting.set(false);
            this.snackBarService.showSnackBar(`Error al actualizar la categoría: ${err}`, 'error-snackbar', 3000, 'end', 'top');
          },
          complete: () => {
            this.isSubmitting.set(false);
            this.resetForm();
            this.goBack();
          }
        });
      }else{
        this.categoryService.save(category).subscribe({
          next: (res) => {
            this.snackBarService.showSnackBar(`Se guardó con éxito la categoría ${res.name}`, 'success-snackbar', 3000, 'end', 'top');
          },
          error: (err) => {
            this.isSubmitting.set(false);
            this.snackBarService.showSnackBar(`Error al guardar la categoría: ${err}`, 'error-snackbar', 3000, 'end', 'top');
          },
          complete: () => {
            this.isSubmitting.set(false);
            this.resetForm();
            this.goBack();
          }
        });
      }

    }else{
      let categories: Category[] = [];

      this.categories.value.forEach((item: string) => {
        categories.push({ID: 0, name: item});
      });

      this.categoryService.saveMany(categories).subscribe({
        next: () => {
          this.snackBarService.showSnackBar(`Se guardaron con éxito las categorías`, 'success-snackbar', 3000, 'end', 'top');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.snackBarService.showSnackBar(`Error al guardar las categorías: ${err}`, 'error-snackbar', 3000, 'end', 'top');
        },
        complete: () => {
          this.isSubmitting.set(false);
          this.resetForm();
          this.goBack();
        }
      });
    }
  }

  resetForm(){
    if (this.formDirective) {
      this.formDirective.resetForm();
    }
    this.categoryForm.reset();
  }

  get breadcrumbs(): BreadcrumbItem[] {
    return [
      { label: 'Productos', route: '/products' },
      { label: 'Categorías', route: '/categories' },
      { label: this.hasExist ? 'Editar categoría' : 'Crear categoría' }
    ];
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (!this.categoryForm.dirty || this.isSubmitting()) {
      return true;
    }
    const dialogRef = this.dialog.open(DialogWarningComponent, {
      data: {
        title: 'Cambios sin guardar',
        message: 'Tienes modificaciones sin guardar en la categoría. Si sales ahora, se perderán los cambios.',
        confirmText: 'Salir sin guardar',
        cancelText: 'Continuar editando',
        isDestructive: true,
      }
    });
    return dialogRef.afterClosed().pipe(map(result => result === 'confirm'));
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.dialog.openDialogs.length === 0) {
      this.goBack();
    }
  }

  goBack() {
    this.router.navigate(['/categories']);
  }

}


