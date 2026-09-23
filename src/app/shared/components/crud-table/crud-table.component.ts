import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { DialogWarningComponent } from '@shared/components/dialog/warning/dialog-warning.component';
import { TitleComponent } from '@shared/components/title/title.component';
import { TableColumn } from './crud-table.models';

@Component({
  selector: 'app-crud-table',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TitleComponent
  ],
  templateUrl: './crud-table.component.html',
  styleUrl: './crud-table.component.css'
})
export class CrudTableComponent<T = any> {
  // Inputs
  title = input.required<string>();
  icon = input.required<string>();
  searchLabel = input<string>('Buscar');
  searchPlaceholder = input<string>('Buscar...');
  columns = input.required<TableColumn<T>[]>();
  data = input.required<T[]>();
  isLoading = input<boolean>(false);
  createRoute = input<string>();
  editRoutePrefix = input<string>();
  entityName = input<string>('elemento');
  allowedRoles = input<string[]>(['ROOT', 'ADMIN', 'WRITE']);
  filterPredicate = input<(data: T, filter: string) => boolean>();

  // Outputs
  deleteConfirmed = output<T>();
  editItem = output<T>();
  createItem = output<void>();

  // Services
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  // Table state
  dataSource = new MatTableDataSource<T>([]);
  displayedColumns = computed(() => [...this.columns().map(c => c.key), 'actions']);
  permission = computed(() => this.authService.hasAnyRole(this.allowedRoles()));

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  @ViewChild(MatSort) set sort(sort: MatSort) {
    if (sort) {
      this.dataSource.sort = sort;
    }
  }

  constructor() {
    effect(() => {
      const items = this.data();
      this.dataSource.data = items || [];

      if (this.filterPredicate()) {
        this.dataSource.filterPredicate = this.filterPredicate()!;
      } else {
        this.dataSource.filterPredicate = (item: any, filter: string) => {
          const searchStr = this.columns()
            .map(c => c.format ? String(c.format(item)) : String(item[c.key] ?? ''))
            .join(' ')
            .toLowerCase();
          return searchStr.includes(filter);
        };
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilter(input: HTMLInputElement): void {
    input.value = '';
    this.dataSource.filter = '';
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onCreate(): void {
    if (this.createRoute()) {
      this.router.navigate([this.createRoute()]);
    } else {
      this.createItem.emit();
    }
  }

  onEdit(row: any): void {
    if (this.editRoutePrefix()) {
      const id = row.ID ?? row.id;
      this.router.navigate([`${this.editRoutePrefix()}/${id}`]);
    } else {
      this.editItem.emit(row);
    }
  }

  onDelete(row: any): void {
    const entity = this.entityName();
    const itemName = row.name || row.title || row.code || '';
    const dialogRef = this.dialog.open(DialogWarningComponent, {
      width: '420px',
      data: {
        title: `Eliminar ${entity}`,
        itemName: itemName,
        message: `¿Estás seguro de que deseas eliminar este/a ${entity}?`,
        isDestructive: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.deleteConfirmed.emit(row);
      }
    });
  }
}
