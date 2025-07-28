import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CustomerService } from '@features/customer/services/customer.service';
import { Customer } from '../../model/customer';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule, FormGroupDirective, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TitleComponent } from '@shared/components/title/title.component';
import { SnackBarService } from '@shared/services/snackbar.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css',
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
export class CustomerComponent implements OnInit {

  @ViewChild('formDirective') private formDirective: FormGroupDirective | undefined;
  customerId: string | null = null;
  hasExist: boolean = false;
  id: number = 0;

  private customerService = inject(CustomerService);
  private formBuilder = inject(FormBuilder);
  private snackBarService = inject(SnackBarService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  customerForm = this.formBuilder.group({
    customers: this.formBuilder.array([
      this.formBuilder.group({
        name: ['', Validators.required],
        contact_info: ['', [Validators.required, Validators.maxLength(255)]],
      })
    ]),
  });

  get customers(): FormArray {
    return this.customerForm.get('customers') as FormArray;
  }

  ngOnInit(): void {
    this.customerId = this.route.snapshot.params['id'];
    if (this.customerId !== 'create') {
      if(this.customerId){
        this.hasExist = true;
        this.customerService.getById(+this.customerId).subscribe({
          next: (res) => {
            this.id = res.ID
            this.customers.controls[0].setValue({
              name: res.name,
              contact_info: res.contact_info
            })
          },
          error: (err) => this.snackBarService.showSnackBar(`Error al cargar el cliente: ${err}`, 'error-snackbar', 3000, 'end', 'top')
        })
      }
    }
  }


  addCustomer(){
    if (this.customers.length >= 10) {
      this.snackBarService.showSnackBar('Puedes agregar hasta 10 clientes', 'error-snackbar', 3000, 'end', 'top')
      return
    }
    this.customers.push(this.formBuilder.group({
        name: ['', Validators.required],
        contact_info: ['', Validators.maxLength(255)],
    }));
  }

  removeCustomer(){
    if (this.customers.length <= 1) {
      this.snackBarService.showSnackBar('Debe haber al menos un cliente', 'error-snackbar', 3000, 'end', 'top')
      return
    }
    this.customers.removeAt(this.customers.length - 1)
  }

  onSubmit(){
    if (this.customers.length === 1) {
      const customer: Customer = {
          ID: this.id || 0,
          name: this.customers.value[0].name,
          contact_info: this.customers.value[0].contact_info,
      };
      if (this.id > 0) {

        this.customerService.update(this.id, customer).subscribe({
          next: (res) => {
            this.snackBarService.showSnackBar(`Se actualizó con éxito el cliente ${res.name}`, 'success-snackbar', 3000, 'end', 'top')
          },
          complete: () => {
            this.resetForm();
            this.goBack();
          }
        })
      }else{
        this.customerService.save(customer).subscribe({
          next: (res) => {
            this.snackBarService.showSnackBar(`Se guardó con éxito el cliente ${res.name}`, 'success-snackbar', 3000, 'end', 'top')
          },
          complete: () => {
            this.resetForm();
            this.goBack();
          }
        })
      }

    }else{
      const customers: Customer[] = this.customers.value.map((item: { name: string; contact_info: string }) => ({
        ID: 0,
        name: item.name,
        contact_info: item.contact_info,
      }));

      this.customerService.saveMany(customers).subscribe({
        next: () => {
          this.snackBarService.showSnackBar(`Se guardaron con éxito los clientes`, 'success-snackbar', 3000, 'end', 'top')
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
    this.customerForm.reset();
  }

  goBack() {
    this.router.navigate(['/customers']);
  }

}


