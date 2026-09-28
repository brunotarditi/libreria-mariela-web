import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Brand } from '@features/brand/model/brand';
import { BrandService } from '@features/brand/services/brand.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BreadcrumbComponent, BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb.component';
import { DialogWarningComponent } from '@shared/components/dialog/warning/dialog-warning.component';
import { ComponentCanDeactivate } from '@core/guards/pending-changes.guard';
import { Category } from '@features/category/model/category';
import { CategoryService } from '@features/category/services/category.service';
import { Product } from '@features/product/model/product';
import { ProductService } from '@features/product/service/product.service';
import { DialogFormComponent } from '@shared/components/dialog/form/dialog-form.component';
import { TitleComponent } from '@shared/components/title/title.component';
import { FieldControlConfig } from '@shared/models/dialog';
import { SnackBarService } from '@shared/services/snackbar.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveFormsModule,
    TitleComponent,
    BreadcrumbComponent,
  ],
})
export class ProductComponent implements OnInit, ComponentCanDeactivate {
  productId: string | null = null;
  selectedFile!: File;
  message: string = '';
  categories: Category[] = [];
  brands: Brand[] = [];
  id: number = 0;
  isSubmitting = signal<boolean>(false);

  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBarService = inject(SnackBarService);
  private categoryService = inject(CategoryService);
  private brandService = inject(BrandService);
  private productService = inject(ProductService);

  productForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(65)]],
    code: ['', [Validators.required, Validators.maxLength(20)]],
    sku: ['', Validators.maxLength(20)],
    profitMargin: ['', [Validators.required, Validators.max(100)]],
    description: ['', Validators.maxLength(150)],
    category: [null as number | null, [Validators.required, Validators.min(1)]],
    brand: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  get name() {
    return this.productForm.get('name') as FormControl;
  }

  get code() {
    return this.productForm.get('code') as FormControl;
  }

  get sku() {
    return this.productForm.get('sku') as FormControl;
  }

  get profitMargin() {
    return this.productForm.get('profitMargin') as FormControl;
  }

  get description() {
    return this.productForm.get('description') as FormControl;
  }

  get category() {
    return this.productForm.get('category') as FormControl;
  }

  get brand() {
    return this.productForm.get('brand') as FormControl;
  }

  private getErrorMessage(err: any, fallback: string): string {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    if (err.error) {
      if (typeof err.error === 'string') return err.error;
      if (err.error.error && typeof err.error.error === 'string') return err.error.error;
      if (err.error.message && typeof err.error.message === 'string') return err.error.message;
    }
    return err.message || fallback;
  }

  ngOnInit() {
    this.loadCategories();
    this.loadBrands();
    this.productId = this.route.snapshot.params['id'];
    if (this.productId !== 'create' && this.productId) {
      this.productService.getById(+this.productId).subscribe({
        next: (res) => {
          this.id = res.ID;
          this.productForm.setValue({
            name: res.name,
            sku: res.sku,
            code: res.code,
            profitMargin: String(res.profit_margin),
            description: res.description,
            category: res.category_id,
            brand: res.brand_id
          });
        },
        error: (err) => {
          const msg = this.getErrorMessage(err, 'No se pudo cargar el producto');
          this.snackBarService.showSnackBar(`Error al cargar el producto: ${msg}`, 'error-snackbar', 3000, 'end', 'top');
        }
      });
    }
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories = res,
      error: (err) => {
        const msg = this.getErrorMessage(err, 'No se pudieron cargar las categorías');
        this.snackBarService.showSnackBar(`Error al cargar las categorías: ${msg}`, 'error-snackbar', 3000, 'end', 'top');
      }
    });
  }

  loadBrands() {
    this.brandService.getAll().subscribe({
      next: (res) => this.brands = res,
      error: (err) => {
        const msg = this.getErrorMessage(err, 'No se pudieron cargar las marcas');
        this.snackBarService.showSnackBar(`Error al cargar las marcas: ${msg}`, 'error-snackbar', 3000, 'end', 'top');
      }
    });
  }

  onSubmit() {
    if (this.productForm.invalid || this.isSubmitting()) {
      this.productForm.markAllAsTouched();
      return;
    }

    const categoryId = Number(this.category.value);
    const brandId = Number(this.brand.value);
    if (!categoryId || categoryId <= 0) {
      this.snackBarService.showSnackBar('Debe seleccionar una categoría válida', 'error-snackbar', 3000, 'end', 'top');
      return;
    }
    if (!brandId || brandId <= 0) {
      this.snackBarService.showSnackBar('Debe seleccionar una marca válida', 'error-snackbar', 3000, 'end', 'top');
      return;
    }

    this.isSubmitting.set(true);
    const product: Product = {
      ID: 0,
      name: this.name.value,
      code: this.code.value,
      sku: this.sku.value || '',
      profit_margin: Number(this.profitMargin.value),
      description: this.description.value || '',
      category_id: categoryId,
      brand_id: brandId,
    };

    if (this.id > 0) {
      this.productService.update(this.id, product).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.snackBarService.showSnackBar(`Se actualizó con éxito el producto ${res.name.toLowerCase()}`, 'success-snackbar', 3000, 'end', 'top');
          this.productForm.reset();
          this.goBack();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = this.getErrorMessage(err, 'No se pudo actualizar el producto');
          this.snackBarService.showSnackBar(`Error al actualizar el producto: ${msg}`, 'error-snackbar', 3500, 'end', 'top');
        }
      });
    } else {
      this.productService.save(product).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.snackBarService.showSnackBar('Producto creado con éxito', 'success-snackbar', 3000, 'end', 'top');
          this.productForm.reset();
          this.goBack();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = this.getErrorMessage(err, 'No se pudo crear el producto');
          this.snackBarService.showSnackBar(`Error al crear el producto: ${msg}`, 'error-snackbar', 3500, 'end', 'top');
        }
      });
    }
  }

  addCategory() {
    const dialogRef = this.dialog.open(DialogFormComponent, {
      width: '400px',
      data: {
        title: 'Crea tu categoría',
        fields: [
          { name: 'name', label: 'Nombre', type: 'text', validators: [Validators.required, Validators.maxLength(65)] },
        ] as FieldControlConfig[]
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.name && result.name.trim()) {
        const category: Category = { ID: 0, name: result.name.trim() };
        this.categoryService.save(category).subscribe({
          next: (res) => {
            this.categories = [...this.categories, res];
            this.productForm.patchValue({ category: res.ID });
            this.snackBarService.showSnackBar('Categoría creada con éxito', 'success-snackbar', 3000, 'end', 'top');
          },
          error: (err) => {
            const msg = this.getErrorMessage(err, 'No se pudo crear la categoría');
            this.snackBarService.showSnackBar(`Error al crear la categoría: ${msg}`, 'error-snackbar', 3000, 'end', 'top');
          }
        });
      }
    });
  }

  addBrand() {
    const dialogRef = this.dialog.open(DialogFormComponent, {
      width: '400px',
      data: {
        title: 'Crea tu marca',
        fields: [
          { name: 'name', label: 'Nombre', type: 'text', validators: [Validators.required] },
        ] as FieldControlConfig[]
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.name && result.name.trim()) {
        const brand: Brand = { ID: 0, name: result.name.trim() };
        this.brandService.save(brand).subscribe({
          next: (res) => {
            this.brands = [...this.brands, res];
            this.productForm.patchValue({ brand: res.ID });
            this.snackBarService.showSnackBar('Marca creada con éxito', 'success-snackbar', 3000, 'end', 'top');
          },
          error: (err) => {
            const msg = this.getErrorMessage(err, 'No se pudo crear la marca');
            this.snackBarService.showSnackBar(`Error al crear la marca: ${msg}`, 'error-snackbar', 3000, 'end', 'top');
          }
        });
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onImportExcel() {
    this.productService.importExcel(this.selectedFile).subscribe({
      next: (res: any) => this.message = res.message,
      error: (err) => {
        const msg = this.getErrorMessage(err, 'Error al importar excel');
        this.snackBarService.showSnackBar(msg, 'error-snackbar', 3500, 'end', 'top');
      }
    });
  }

  exportExcel() {
    this.productService.exportExcel().subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = 'productos.xlsx';
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: (err) => {
        const msg = this.getErrorMessage(err, 'Error al exportar modelo');
        this.snackBarService.showSnackBar(msg, 'error-snackbar', 3500, 'end', 'top');
      }
    });
  }

  get breadcrumbs(): BreadcrumbItem[] {
    return [
      { label: 'Productos', route: '/products' },
      { label: this.productId === 'create' ? 'Crear producto' : 'Editar producto' }
    ];
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (!this.productForm.dirty || this.isSubmitting()) {
      return true;
    }
    const dialogRef = this.dialog.open(DialogWarningComponent, {
      data: {
        title: 'Cambios sin guardar',
        message: 'Tienes modificaciones sin guardar en el producto. Si sales ahora, se perderán los cambios.',
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
    this.router.navigate(['/products']);
  }
}
