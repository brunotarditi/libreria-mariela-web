import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SupplierService } from '@features/supplier/services/supplier.service';
import { Supplier } from '../../model/supplier';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TitleComponent } from '@shared/components/title/title.component';
import { SnackBarService } from '@shared/services/snackbar.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.css',
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
export class SupplierComponent implements OnInit {

  @ViewChild('formDirective') private formDirective: FormGroupDirective | undefined;
  supplierId: string | null = null;
  hasExist: boolean = false;
  id: number = 0;

  private supplierService = inject(SupplierService);
  private formBuilder = inject(FormBuilder);
  private snackBarService = inject(SnackBarService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);


  supplierForm = this.formBuilder.group({
    suppliers: this.formBuilder.array([
      this.formBuilder.group({
        name: ['', Validators.required],
        contact_info: ['', [Validators.required, Validators.maxLength(255)]],
      })
    ]),
  });

  get suppliers(): FormArray {
    return this.supplierForm.get('suppliers') as FormArray;
  }

  ngOnInit(): void {
    this.supplierId = this.route.snapshot.params['id'];
    if (this.supplierId !== 'create') {
      if(this.supplierId){
        this.hasExist = true;
        this.supplierService.getById(+this.supplierId).subscribe({
          next: (res) => {
            this.id = res.ID
            this.suppliers.controls[0].setValue({
              name: res.name,
              contact_info: res.contact_info
            })
          },
        })
      }
    }
  }

  addCustomer(){
    if (this.suppliers.length >= 10) {
      this.snackBarService.showSnackBar('Puedes agregar hasta 10 proveedores', 'error-snackbar', 3000, 'end', 'top')
      return
    }
    this.suppliers.push(this.formBuilder.group({
        name: ['', Validators.required],
        contact_info: ['', Validators.maxLength(255)],
    }));
  }

  removeCustomer(){
    if (this.suppliers.length <= 1) {
      this.snackBarService.showSnackBar('Debe haber al menos un proveedor', 'error-snackbar', 3000, 'end', 'top')
      return
    }
    this.suppliers.removeAt(this.suppliers.length - 1)
  }

  onSubmit(){
    if (this.suppliers.length === 1) {
      const supplier: Supplier = {
          ID: this.id || 0,
          name: this.suppliers.value[0].name,
          contact_info: this.suppliers.value[0].contact_info,
      };
      if (this.id > 0) {

        this.supplierService.update(this.id, supplier).subscribe({
          next: (res) => {
            this.snackBarService.showSnackBar(`Se actualizó con éxito el proveedor ${res.name}`, 'success-snackbar', 3000, 'end', 'top')
          },
          complete: () => {
            this.resetForm();
            this.goBack();
          }
        })
      }else{

        this.supplierService.save(supplier).subscribe({
          next: (res) => {
            this.snackBarService.showSnackBar(`Se guardó con éxito el proveedor ${res.name}`, 'success-snackbar', 3000, 'end', 'top')
          },
          complete: () => {
            this.resetForm();
            this.goBack();
          }
        })
      }

    }else{
      const suppliers: Supplier[] = this.suppliers.value.map((item: { name: string; contact_info: string }) => ({
        ID: 0,
        name: item.name,
        contact_info: item.contact_info,
      }));

      this.supplierService.saveMany(suppliers).subscribe({
        next: () => {
          this.snackBarService.showSnackBar(`Se guardaron con éxito los proveedores`, 'success-snackbar', 3000, 'end', 'top')
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
    this.supplierForm.reset();
  }

  goBack() {
    this.router.navigate(['/suppliers']);
  }

}


