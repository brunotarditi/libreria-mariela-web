import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrandService } from '@features/brand/services/brand.service';
import { Brand } from '../../model/brand';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TitleComponent } from '@shared/components/title/title.component';
import { SnackBarService } from '@shared/services/snackbar.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css',
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
export class BrandComponent implements OnInit {

  @ViewChild('formDirective') private formDirective: FormGroupDirective | undefined;
  brandId: string | null = null;
  hasExist: boolean = false;
  id: number = 0;

  private brandService = inject(BrandService);
  private formBuilder = inject(FormBuilder);
  private snackBarService = inject(SnackBarService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  brandForm = this.formBuilder.group({
    names: this.formBuilder.array([
      this.formBuilder.control('', Validators.required)
    ])
  });

  get brands() {
    return this.brandForm.get('names') as FormArray
  }

  ngOnInit() {
    this.brandId = this.route.snapshot.params['id'];
    if (this.brandId !== 'create') {
      if(this.brandId){
        this.hasExist = true;
        this.brandService.getById(+this.brandId).subscribe({
          next: (res) => {
            this.id = res.ID
            this.brands.controls[0].setValue(res.name)
          },
          error: (err) => this.snackBarService.showSnackBar(`Error al cargar la marca: ${err}`, 'error-snackbar', 3000, 'end', 'top')
        })
      }
    }
  }

  addField(){
    if (this.brands.length >= 10) {
      this.snackBarService.showSnackBar('Puedes agregar hasta 10 marcas', 'error-snackbar', 3000, 'end', 'top')
      return
    }
    this.brands.push(this.formBuilder.control('', Validators.required))
  }

  deleteField(){
    if (this.brands.length <= 1) {
      this.snackBarService.showSnackBar('Debe haber al menos una marca', 'error-snackbar', 3000, 'end', 'top')
      return
    }
    this.brands.removeAt(this.brands.length - 1)
  }

  onSubmit(){
    if (this.brands.length === 1) {
      const brand: Brand = {
          ID: this.id || 0,
          name: this.brands.value[0]
        }
      if (this.id > 0) {
        this.brandService.update(this.id, brand).subscribe({
          next: (res) => {
            this.snackBarService.showSnackBar(`Se actualizó con éxito la marca ${res.name}`, 'success-snackbar', 3000, 'end', 'top')
          },
          complete: () => {
            this.resetForm();
            this.goBack();
          }
        })
      }else{
        this.brandService.save(brand).subscribe({
          next: (res) => {
            this.snackBarService.showSnackBar(`Se guardó con éxito la marca ${res.name}`, 'success-snackbar', 3000, 'end', 'top')
          },
          complete: () => {
            this.resetForm();
            this.goBack();
          }
        })
      }

    }else{
      let brands: Brand[] = []

      this.brands.value.forEach((item: string) => {
        brands.push({ID: 0, name: item})
      });

      this.brandService.saveMany(brands).subscribe({
        next: () => {
          this.snackBarService.showSnackBar(`Se guardaron con éxito las marcas`, 'success-snackbar', 3000, 'end', 'top')
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
    this.brandForm.reset();
  }

  goBack() {
    this.router.navigate(['/brands']);
  }

}


