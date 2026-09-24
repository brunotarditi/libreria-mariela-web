import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, HostListener, inject, input, output, signal, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
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
    MatCheckboxModule,
    MatMenuModule,
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
  searchPlaceholder = input<string>('Buscar... (Presiona /)');
  columns = input.required<TableColumn<T>[]>();
  data = input.required<T[]>();
  isLoading = input<boolean>(false);
  createRoute = input<string>();
  editRoutePrefix = input<string>();
  entityName = input<string>('elemento');
  allowedRoles = input<string[]>(['ROOT', 'ADMIN', 'WRITE']);
  filterPredicate = input<(data: T, filter: string) => boolean>();
  enableSelection = input<boolean>(true);

  @ViewChild('input') searchInput?: ElementRef<HTMLInputElement>;

  // Outputs
  deleteConfirmed = output<T>();
  bulkDeleteConfirmed = output<T[]>();
  editItem = output<T>();
  createItem = output<void>();

  // Services
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  // Selection & Columns state
  selection = new SelectionModel<T>(true, []);
  visibleColumnKeys = signal<string[]>([]);

  // Table state
  dataSource = new MatTableDataSource<T>([]);
  displayedColumns = computed(() => {
    const visible = this.columns()
      .filter(c => this.visibleColumnKeys().includes(c.key))
      .map(c => c.key);
    const cols: string[] = [];
    if (this.enableSelection()) {
      cols.push('select');
    }
    cols.push(...visible);
    cols.push('actions');
    return cols;
  });
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
      const cols = this.columns();
      if (this.visibleColumnKeys().length === 0 && cols && cols.length > 0) {
        this.visibleColumnKeys.set(cols.map(c => c.key));
      }
    });

    effect(() => {
      const items = this.data();
      this.dataSource.data = items || [];
      this.selection.clear();

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

  // Column visibility
  toggleColumn(key: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const current = this.visibleColumnKeys();
    if (current.includes(key)) {
      if (current.length <= 1) {
        return;
      }
      this.visibleColumnKeys.set(current.filter(k => k !== key));
    } else {
      this.visibleColumnKeys.set([...current, key]);
    }
  }

  isColumnVisible(key: string): boolean {
    return this.visibleColumnKeys().includes(key);
  }

  // Selection helpers
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.filteredData.length;
    return numRows > 0 && numSelected === numRows;
  }

  isSomeSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.filteredData.length;
    return numRows > 0 && numSelected < numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.filteredData);
  }

  onBulkDelete(): void {
    const selectedItems = this.selection.selected;
    const count = selectedItems.length;
    if (count === 0) return;

    const entity = this.entityName();
    const dialogRef = this.dialog.open(DialogWarningComponent, {
      width: '420px',
      data: {
        title: `Eliminar ${count} ${entity}s`,
        message: `¿Estás seguro de que deseas eliminar los ${count} ${entity}s seleccionados?`,
        confirmText: 'Eliminar seleccionados',
        cancelText: 'Cancelar',
        isDestructive: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.bulkDeleteConfirmed.emit(selectedItems);
        this.selection.clear();
      }
    });
  }

  // Export to CSV
  exportToCsv(): void {
    const data = this.dataSource.filteredData;
    if (!data || data.length === 0) {
      return;
    }

    const activeCols = this.columns().filter(c => this.visibleColumnKeys().includes(c.key));
    const headerRow = activeCols.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');

    const rows = data.map(item => {
      return activeCols.map(c => {
        let val = c.format ? c.format(item) : (item as any)[c.key];
        if (val === null || val === undefined) {
          val = '';
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${this.title().toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
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

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    if (event.key === '/' && !this.isEditingInput(event)) {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  }

  private isEditingInput(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement;
    return !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
  }
}
