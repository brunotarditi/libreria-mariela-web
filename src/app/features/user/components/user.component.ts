import { Component, inject, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { UserService } from '../services/user.service';
import { User } from '../model/user';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TitleComponent } from '@shared/components/title/title.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { SnackBarService } from '@shared/services/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogFormComponent } from '@shared/components/dialog/form/dialog-form.component';
import { FieldControlConfig } from '@shared/models/dialog';
import { Validators } from '@angular/forms';
import { Option } from '../../../shared/models/option';
import { DialogWarningComponent } from '@shared/components/dialog/warning/dialog-warning.component';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    TitleComponent
  ],
})
export class UserComponent {

  displayedColumns: string[] = ['user_name', 'created_at', 'is_active', 'last_login', 'roles', 'actions'];
  dataSource: MatTableDataSource<User> = new MatTableDataSource<User>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  private snackBarService = inject(SnackBarService);
  private userService = inject(UserService);
  dialog = inject(MatDialog);

  isUpdate: boolean = false;
  id: number = 0;

  options: Option[] = [
    {id: 1, value: 'ADMIN', text: 'Admin'},
    {id: 2, value: 'WRITE', text: 'Escritura'},
    {id: 3, value: 'READ', text: 'Lectura'},
  ]

  ngAfterViewInit() {
    if(this.dataSource && this.paginator && this.sort){
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngOnInit(): void {
    this.getData();
  }

  getData(){
    this.userService.getAll().subscribe({
      next: (res) => {
        this.dataSource = new MatTableDataSource<User>(res)
        this.dataSource.filterPredicate = (data: User, filter: string) => {
          return data.user_name.trim().toLowerCase().indexOf(filter) !== -1
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

  isActive(id: number, is_active: boolean) {
    const dialogRef = this.dialog.open(DialogWarningComponent, {
      width: '400px',
      data: {
        title: is_active ?  'Activar usuario': 'Desactivar usuario',
        message: is_active ? "¿Quieres activar nuevamente esta cuenta?" : "¿Estás seguro de desactivar esta cuenta?"
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.userService.patch(id, is_active).subscribe({
          next: () => {
            this.snackBarService.showSnackBar(`Se ha ${is_active ? 'desactivado' : 'activado'} el usuario`, 'success-snackbar', 3000, 'end', 'top')
            this.getData()
          },
          error: (err) => {
            this.snackBarService.showSnackBar(`Ha ocurrido el siguiente error: ${err.error.error}`, 'error-snackbar', 3000, 'end', 'top')
          },
    })
      }
    });

  }

  isRoot(roles: string[] | null | undefined): boolean {
    return roles ? roles.some(role => role === 'ROOT') : false;
  }

  assignRole(id: number){
    const dialogRef = this.dialog.open(DialogFormComponent, {
      width: '350px',
      data: {
        title: 'Asigna el rol',
        fields: [
          { name: 'role', label: 'Rol', type: 'select', options: this.options ,validators: [Validators.required] },
        ] as FieldControlConfig[]
      },
    });

    dialogRef.afterClosed().subscribe(result => {
          if (result !== undefined) {
            const roleName = this.options.find(option => option.id === result.role)
            this.userService.assignRol(id, roleName!.value).subscribe({
              next: (res) => {
                const data = this.dataSource.data;
                const userIndex = data.findIndex((user) => user.id === id);
                if (userIndex !== -1) {
                  data[userIndex].roles = data[userIndex].roles || [];
                  if (!data[userIndex].roles.includes(result)) {
                    data[userIndex].roles.push(result);
                  }
                  this.dataSource.data = [...data];
                }
                this.snackBarService.showSnackBar(`${res.message}`, 'success-snackbar', 3000, 'end', 'top')
              },
            });
          }
        });
  }

}
