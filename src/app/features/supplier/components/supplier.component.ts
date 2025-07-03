import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SupplierService } from '@features/supplier/services/supplier.service';
import { Supplier } from '../model/supplier';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { TitleComponent } from '@shared/components/title/title.component';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.css',
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
export class SupplierComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'actions'];
  dataSource: MatTableDataSource<Supplier> = new MatTableDataSource<Supplier>([]);
  readonly panelOpenState = signal(true);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;
  @ViewChild('formDirective') private formDirective: FormGroupDirective | undefined;

  private supplierService = inject(SupplierService);
  private formBuilder = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);

  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  isUpdate: boolean = false;
  id: number = 0;

  supplierForm = this.formBuilder.group({
    names: this.formBuilder.array([
      this.formBuilder.control('', Validators.required)
    ])
  });

  get suppliers() {
    return this.supplierForm.get('names') as FormArray
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
    this.supplierService.getAll().subscribe({
      next: (res) => {
        this.dataSource = new MatTableDataSource<Supplier>(res)
        this.dataSource.filterPredicate = (data: Supplier, filter: string) => {
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
    if (this.suppliers.length >= 10) {
      this.showSnackBar('Puedes agregar hasta 10 marcas', 'error-snackbar')
      return
    }
    this.suppliers.push(this.formBuilder.control('', Validators.required))
  }

  deleteField(){
    if (this.suppliers.length <= 1) {
      this.showSnackBar('Debe haber al menos una marca', 'error-snackbar')
      return
    }
    this.suppliers.removeAt(this.suppliers.length - 1)
  }

  onSubmit(){
    this.isUpdate = false;
    if (this.suppliers.length === 1) {
      if (this.id > 0) {
        const supplier: Supplier = {
          ID: this.id,
          name: this.suppliers.value[0]
        }

        this.supplierService.update(this.id, supplier).subscribe({
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
        const supplier: Supplier = {
          ID: 0,
          name: this.suppliers.value[0]
        }

        this.supplierService.save(supplier).subscribe({
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
      let suppliers: Supplier[] = []

      this.suppliers.value.forEach((item: string) => {
        suppliers.push({ID: 0, name: item})
      });

      this.supplierService.saveMany(suppliers).subscribe({
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
    this.supplierService.getById(id).subscribe({
      next: (res) => {
        this.id = res.ID
        this.suppliers.controls[0].setValue(res.name)
      }
    })
  }

  onDelete(id: number) {
    this.supplierService.deleteById(id).subscribe({
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
    this.supplierForm.reset();
  }

}


