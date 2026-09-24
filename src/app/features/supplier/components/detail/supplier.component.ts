import { Component, inject, OnInit, ViewChild, signal, HostListener } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SupplierService } from '@features/supplier/services/supplier.service';
import { Supplier } from '../../model/supplier';
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
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveFormsModule,
    CommonModule,
    TitleComponent,
    BreadcrumbComponent,
  ],
})
export class SupplierComponent implements OnInit, ComponentCanDeactivate {

  @ViewChild('formDirective') private formDirective: FormGroupDirective | undefined;
  supplierId: string | null = null;
  hasExist: boolean = false;
  id: number = 0;
  isSubmitting = signal<boolean>(false);

  private supplierService = inject(SupplierService);
  private formBuilder = inject(FormBuilder);
  private snackBarService = inject(SnackBarService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);


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

  removeCustomer(index: number = this.suppliers.length - 1){
    if (this.suppliers.length <= 1) {
      this.snackBarService.showSnackBar('Debe haber al menos un proveedor', 'error-snackbar', 3000, 'end', 'top')
      return
    }
    this.suppliers.removeAt(index);
  }

  onSubmit(){
    if (this.supplierForm.invalid || this.isSubmitting()) {
      return;
    }
    this.isSubmitting.set(true);

    if (this.suppliers.length === 1) {
      const supplier: Supplier = {
          ID: this.id || 0,
          name: this.suppliers.value[0].name,
          contact_info: this.suppliers.value[0].contact_info,
      };
      if (this.id > 0) {
        this.supplierService.update(this.id, supplier).subscribe({
          next: (res) => {
            this.snackBarService.showSnackBar(`Se actualizó con éxito el proveedor ${res.name}`, 'success-snackbar', 3000, 'end', 'top');
          },
          error: (err) => {
            this.isSubmitting.set(false);
            this.snackBarService.showSnackBar(`Error al actualizar el proveedor: ${err}`, 'error-snackbar', 3000, 'end', 'top');
          },
          complete: () => {
            this.isSubmitting.set(false);
            this.resetForm();
            this.goBack();
          }
        });
      }else{
        this.supplierService.save(supplier).subscribe({
          next: (res) => {
            this.snackBarService.showSnackBar(`Se guardó con éxito el proveedor ${res.name}`, 'success-snackbar', 3000, 'end', 'top');
          },
          error: (err) => {
            this.isSubmitting.set(false);
            this.snackBarService.showSnackBar(`Error al guardar el proveedor: ${err}`, 'error-snackbar', 3000, 'end', 'top');
          },
          complete: () => {
            this.isSubmitting.set(false);
            this.resetForm();
            this.goBack();
          }
        });
      }

    }else{
      const suppliers: Supplier[] = this.suppliers.value.map((item: { name: string; contact_info: string }) => ({
        ID: 0,
        name: item.name,
        contact_info: item.contact_info,
      }));

      this.supplierService.saveMany(suppliers).subscribe({
        next: () => {
          this.snackBarService.showSnackBar(`Se guardaron con éxito los proveedores`, 'success-snackbar', 3000, 'end', 'top');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.snackBarService.showSnackBar(`Error al guardar los proveedores: ${err}`, 'error-snackbar', 3000, 'end', 'top');
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
    this.supplierForm.reset();
  }

  get breadcrumbs(): BreadcrumbItem[] {
    return [
      { label: 'Proveedores', route: '/suppliers' },
      { label: this.hasExist ? 'Editar proveedor' : 'Crear proveedor' }
    ];
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (!this.supplierForm.dirty || this.isSubmitting()) {
      return true;
    }
    const dialogRef = this.dialog.open(DialogWarningComponent, {
      data: {
        title: 'Cambios sin guardar',
        message: 'Tienes modificaciones sin guardar en el proveedor. Si sales ahora, se perderán los cambios.',
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
    this.router.navigate(['/suppliers']);
  }

}


