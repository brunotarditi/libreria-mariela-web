import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { Brand } from '@features/brand/model/brand';
import { BrandService } from '@features/brand/services/brand.service';
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
    ReactiveFormsModule,
    TitleComponent,
  ],
})
export class ProductComponent implements OnInit {
  productId: string | null = null;
  selectedFile!: File;
  message: string = '';
  categories: Category[] = [];
  brands: Brand[] = [];

  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBarService = inject(SnackBarService);
  private categoryService = inject(CategoryService);
  private brandService = inject(BrandService);
  private productService = inject(ProductService);

  productForm = this.formBuilder.group({
    name: ['', [Validators.required,  Validators.maxLength(65)]],
    code: ['', [Validators.required,  Validators.maxLength(20)]],
    sku: ['', Validators.maxLength(20)],
    profitMargin: ['', [Validators.required, Validators.max(100)]],
    description: ['', Validators.maxLength(150)],
    category: [0, Validators.required],
    brand: [0,Validators.required],
  });

  get name() {
    return this.productForm.get('name') as FormControl
  }

  get code() {
    return this.productForm.get('code') as FormControl
  }

  get sku() {
    return this.productForm.get('sku') as FormControl
  }

  get profitMargin() {
    return this.productForm.get('profitMargin') as FormControl
  }

  get description() {
    return this.productForm.get('description') as FormControl
  }

  get category() {
    return this.productForm.get('category') as FormControl
  }

  get brand() {
    return this.productForm.get('brand') as FormControl
  }

  ngOnInit() {
    this.loadCategories();
    this.loadBrands();
    this.productId = this.route.snapshot.params['id'];
    if (this.productId === 'create') {
      this.productForm.setValue({
        name: '',
        code: '',
        sku: '',
        profitMargin: '',
        description: '',
        category: 0,
        brand: 0
      })
    } else {
      if(this.productId){
        this.productService.getById(+this.productId).subscribe({
          next: (res) => {
            this.productForm.setValue(
              {
                name: res.name,
                sku: res.sku,
                code: res.code,
                profitMargin: String(res.profit_margin),
                description: res.description,
                category: res.category_id,
                brand: res.brand_id
              })
          },
          error: (err) => this.snackBarService.showSnackBar(`Error al cargar el producto: ${err}`, 'error-snackbar', 3000, 'end', 'top')
        })
      }
    }
  }

  loadCategories(){
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories = res,
      error: (err) => this.snackBarService.showSnackBar(`Error al cargar las categorías: ${err}`, 'error-snackbar', 3000, 'end', 'top')
    })

  }

  loadBrands(){
    this.brandService.getAll().subscribe({
      next: (res) => this.brands = res,
      error: (err) => this.snackBarService.showSnackBar(`Error al cargar las marcas: ${err}`, 'error-snackbar', 3000, 'end', 'top')
    })
  }

  onSubmit(){
    if (this.productForm.valid) {
      const product: Product = {
        ID: 0,
        name: this.name.value,
        code: this.code.value,
        sku: this.sku.value || '',
        profit_margin: Number(this.profitMargin.value),
        description: this.description.value || '',
        category_id: this.category.value,
        brand_id: this.brand.value,
      };

      this.productService.save(product).subscribe({
        next: () => {
          this.snackBarService.showSnackBar('Producto creado con éxito', 'success-snackbar', 3000, 'end', 'top')
          this.productForm.reset();
          this.router.navigate(['/products'])
        },
        error: () => {
          this.snackBarService.showSnackBar('Error al crear el producto', 'error-snackbar', 3000, 'end', 'top')
        },
      });
    }
  }


  addCategory(){
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
      if (result !== undefined) {
        const category: Category = {ID:0, name: result.name}
        this.categoryService.save(category).subscribe({
          next: (res) => {
            this.categories = [...this.categories, res]
            this.productForm.patchValue({category: res.ID})
            this.snackBarService.showSnackBar('Categoría creada con éxito', 'success-snackbar', 3000, 'end', 'top')
          },
          error: (err) => this.snackBarService.showSnackBar(`Error al crear la categoría: ${err}`, 'error-snackbar', 3000, 'end', 'top')
        });
        if (this.category.value === '0') {
          this.productForm.patchValue({ category: null })
        }
      }
    });
  }

  addBrand() {
    const dialogRef = this.dialog.open(DialogFormComponent, {
      width: '400px',
      data: {
        title: 'Crea tu categoría',
        fields: [
          { name: 'name', label: 'Nombre', type: 'text', validators: [Validators.required] },
        ] as FieldControlConfig[]
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const brand: Brand = {ID:0, name: result.name}
        this.brandService.save(brand).subscribe({
          next: (res) => {
            this.brands = [...this.brands, res]
            this.productForm.patchValue({brand: res.ID})
            this.snackBarService.showSnackBar('Marca creada con éxito', 'success-snackbar', 3000, 'end', 'top')
          },
          error: (err) => this.snackBarService.showSnackBar(`Error al crear la marca: ${err}`, 'error-snackbar', 3000, 'end', 'top')
        });
        if (this.brand.value === '0') {
          this.productForm.patchValue({ brand: null })
        }
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onImportExcel(){
    this.productService.importExcel(this.selectedFile).subscribe({
      next: (res: any) => this.message = res.message
    })
  }

  exportExcel(){
    this.productService.exportExcel().subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = 'productos.xlsx';
        a.click();
        URL.revokeObjectURL(objectUrl);
      },

    })
  }

  goBack() {
    this.router.navigate(['/products']);
  }

}


