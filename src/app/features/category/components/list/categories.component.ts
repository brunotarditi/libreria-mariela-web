import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CategoryService } from '@features/category/services/category.service';
import { Category } from '../../model/category';
import { SnackBarService } from '@shared/services/snackbar.service';
import { CrudTableComponent } from '@shared/components/crud-table/crud-table.component';
import { TableColumn } from '@shared/components/crud-table/crud-table.models';
import { BreadcrumbComponent, BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  standalone: true,
  imports: [CrudTableComponent, BreadcrumbComponent],
})
export class CategoriesComponent implements OnInit {
  categories = signal<Category[]>([]);
  isLoading = signal<boolean>(true);

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Catálogo' },
    { label: 'Categorías' }
  ];

  columns: TableColumn<Category>[] = [
    { key: 'name', label: 'Nombre' }
  ];

  private categoryService = inject(CategoryService);
  private snackBarService = inject(SnackBarService);

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => {
        this.categories.set(res);
        this.isLoading.set(false);
      },
    });
  }

  onDelete(category: Category): void {
    this.categoryService.deleteById(category.ID).subscribe({
      next: (res: any) => {
        this.snackBarService.showSnackBar(`${res.message}`, 'success-snackbar', 3000, 'end', 'top');
        this.getData();
      },
    });
  }

  onBulkDelete(items: Category[]): void {
    this.isLoading.set(true);
    const deleteObservables = items.map(item => this.categoryService.deleteById(item.ID));
    forkJoin(deleteObservables).subscribe({
      next: () => {
        this.snackBarService.showSnackBar(`Se eliminaron ${items.length} categorías con éxito`, 'success-snackbar', 3000, 'end', 'top');
        this.getData();
      },
      error: (err) => {
        this.snackBarService.showSnackBar(`Error al eliminar categorías: ${err}`, 'error-snackbar', 3000, 'end', 'top');
        this.getData();
      }
    });
  }
}
