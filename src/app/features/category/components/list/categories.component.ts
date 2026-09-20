import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoryService } from '@features/category/services/category.service';
import { Category } from '../../model/category';
import { SnackBarService } from '@shared/services/snackbar.service';
import { CrudTableComponent } from '@shared/components/crud-table/crud-table.component';
import { TableColumn } from '@shared/components/crud-table/crud-table.models';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  standalone: true,
  imports: [CrudTableComponent],
})
export class CategoriesComponent implements OnInit {
  categories = signal<Category[]>([]);
  isLoading = signal<boolean>(true);

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
}
