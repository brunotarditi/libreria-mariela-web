import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

import { TitleComponent } from '@shared/components/title/title.component';
import { BreadcrumbComponent, BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb.component';
import { DialogWarningComponent } from '@shared/components/dialog/warning/dialog-warning.component';
import { SnackBarService } from '@shared/services/snackbar.service';

import { BudgetService } from '../../services/budget.service';
import { Budget } from '../../models/budget';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTableModule,
    TitleComponent,
    BreadcrumbComponent
  ],
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.css']
})
export class BudgetsComponent implements OnInit {
  private readonly budgetService = inject(BudgetService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(SnackBarService);

  readonly budgets = signal<Budget[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly searchTerm = signal<string>('');
  readonly downloadingPdfId = signal<number | null>(null);

  readonly displayedColumns: string[] = ['id', 'client_name', 'description', 'items_count', 'total', 'created_at', 'actions'];

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Presupuestos' }
  ];

  readonly filteredBudgets = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.budgets();
    if (!term) return list;

    return list.filter(b => {
      const client = (b.client_name || '').toLowerCase();
      const desc = (b.description || '').toLowerCase();
      const id = String(b.id || b.ID || '');
      return client.includes(term) || desc.includes(term) || id.includes(term);
    });
  });

  ngOnInit(): void {
    this.loadBudgets();
  }

  loadBudgets(): void {
    this.isLoading.set(true);
    this.budgetService.getAll().subscribe({
      next: (data) => {
        // Compute totals and item counts if backend didn't supply them directly
        const normalized = (data || []).map((b: any) => {
          const items = b.items || [];
          const itemsCount = b.items_count !== undefined 
            ? b.items_count 
            : (items.length > 0 ? items.length : ((b.total && b.total > 0) ? 1 : 0));
          const total = b.total !== undefined 
            ? b.total 
            : items.reduce((acc: number, item: any) => acc + (item.quantity * item.unit_price), 0);
          return {
            ...b,
            id: b.id || b.ID || 0,
            items,
            items_count: itemsCount,
            total
          };
        });
        this.budgets.set(normalized);
        this.isLoading.set(false);
      },
      error: () => {
        this.budgets.set([]);
        this.isLoading.set(false);
      }
    });
  }

  getItemsCount(budget: Budget): number {
    if (budget.items_count !== undefined && budget.items_count > 0) {
      return budget.items_count;
    }
    if (budget.items && Array.isArray(budget.items) && budget.items.length > 0) {
      return budget.items.length;
    }
    return (budget.total && budget.total > 0) ? 1 : 0;
  }

  onCreateBudget(): void {
    this.router.navigate(['/budgets/create']);
  }

  downloadPdf(budget: Budget, event?: Event): void {
    if (event) event.stopPropagation();

    const id = budget.id || budget.ID;
    this.downloadingPdfId.set(id || -1);

    this.budgetService.downloadPdf(id).subscribe({
      next: (blob) => {
        this.downloadingPdfId.set(null);
        const filename = `presupuesto_${budget.client_name.toLowerCase().replace(/\s+/g, '_')}_${id || 'draft'}.pdf`;
        this.budgetService.triggerPdfDownload(blob, filename);
        this.snackBar.showSnackBar('PDF descargado con éxito', 'success-snackbar', 2500, 'end', 'top');
      },
      error: () => {
        this.downloadingPdfId.set(null);
        this.snackBar.showSnackBar('No se pudo generar el PDF del presupuesto', 'error-snackbar', 3000, 'end', 'top');
      }
    });
  }

  onDeleteBudget(budget: Budget, event?: Event): void {
    if (event) event.stopPropagation();

    const id = budget.id || budget.ID;
    if (!id) return;

    const dialogRef = this.dialog.open(DialogWarningComponent, {
      data: {
        title: 'Eliminar Presupuesto',
        message: `¿Estás seguro de eliminar el presupuesto de "${budget.client_name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDestructive: true
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.budgetService.delete(id).subscribe({
          next: () => {
            this.snackBar.showSnackBar('Presupuesto eliminado con éxito', 'success-snackbar', 2500, 'end', 'top');
            this.loadBudgets();
          },
          error: (err) => {
            const msg = err.error?.error || err.error?.message || 'Error al eliminar el presupuesto';
            this.snackBar.showSnackBar(msg, 'error-snackbar', 3000, 'end', 'top');
          }
        });
      }
    });
  }
}
