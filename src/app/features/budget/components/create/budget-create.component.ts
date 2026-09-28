import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TitleComponent } from '@shared/components/title/title.component';
import { BreadcrumbComponent, BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb.component';
import { DialogWarningComponent } from '@shared/components/dialog/warning/dialog-warning.component';
import { ComponentCanDeactivate } from '@core/guards/pending-changes.guard';
import { SnackBarService } from '@shared/services/snackbar.service';

import { BudgetService } from '../../services/budget.service';
import { CreateBudgetRequest } from '../../models/budget';
import { ProductService } from '@features/product/service/product.service';
import { ProductData } from '@features/product/model/product';
import { CustomerService } from '@features/customer/services/customer.service';
import { Customer } from '@features/customer/model/customer';

@Component({
  selector: 'app-budget-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TitleComponent,
    BreadcrumbComponent
  ],
  templateUrl: './budget-create.component.html',
  styleUrls: ['./budget-create.component.css']
})
export class BudgetCreateComponent implements OnInit, ComponentCanDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(SnackBarService);
  private readonly budgetService = inject(BudgetService);
  private readonly productService = inject(ProductService);
  private readonly customerService = inject(CustomerService);

  readonly isSubmitting = signal<boolean>(false);
  readonly isDownloadingPdf = signal<boolean>(false);
  readonly isSaved = signal<boolean>(false);
  readonly products = signal<ProductData[]>([]);
  readonly customers = signal<Customer[]>([]);

  // Map of active price per product_id from price lists
  private readonly productPrices = new Map<number, number>();

  readonly budgetForm: FormGroup = this.fb.group({
    client_name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(250)]],
    items: this.fb.array([])
  });

  get items(): FormArray {
    return this.budgetForm.get('items') as FormArray;
  }

  // Real-time calculated total
  readonly totalAmount = signal<number>(0);
  readonly itemsCount = signal<number>(0);

  ngOnInit(): void {
    this.loadCatalogData();
    // Start with 1 item row pristine
    this.items.push(this.createItemRow());
    this.budgetForm.markAsPristine();

    this.budgetForm.valueChanges.subscribe(() => {
      this.recalculateTotal();
    });
  }

  private loadCatalogData(): void {
    this.productService.getAll().subscribe({
      next: (list) => this.products.set(list),
      error: () => console.warn('Could not load products for budget creator')
    });

    this.customerService.getAll().subscribe({
      next: (list) => this.customers.set(list),
      error: () => console.warn('Could not load customers for budget creator')
    });

    // Load prices from backend price lists
    this.productService.getPrices().subscribe({
      next: (prices) => {
        if (Array.isArray(prices)) {
          prices.forEach((item: any) => {
            if (item && item.product_id && (item.is_active === undefined || item.is_active)) {
              this.productPrices.set(item.product_id, Number(item.price) || 0);
            }
          });
        }
      },
      error: () => console.warn('Could not load price lists for products')
    });
  }

  createItemRow(): FormGroup {
    return this.fb.group({
      product_id: [null],
      product_name: ['', [Validators.required, Validators.maxLength(100)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  addItem(): void {
    this.items.push(this.createItemRow());
    this.budgetForm.markAsDirty();
    this.recalculateTotal();
  }

  removeItem(index: number): void {
    if (this.items.length <= 1) {
      this.snackBar.showSnackBar('El presupuesto debe contener al menos un ítem', 'error-snackbar', 2500, 'end', 'top');
      return;
    }
    this.items.removeAt(index);
    this.budgetForm.markAsDirty();
    this.recalculateTotal();
  }

  onProductSelect(index: number, event: any): void {
    const productId = event.value;
    if (!productId) return;

    const prod = this.products().find(p => p.id === productId);
    if (prod) {
      const row = this.items.at(index);
      const patchData: { product_name: string; unit_price?: number } = {
        product_name: prod.name
      };

      if (this.productPrices.has(prod.id)) {
        patchData.unit_price = this.productPrices.get(prod.id);
      }

      row.patchValue(patchData);
      this.budgetForm.markAsDirty();
      this.recalculateTotal();
    }
  }

  selectCustomer(name: string): void {
    this.budgetForm.patchValue({ client_name: name });
    this.budgetForm.markAsDirty();
  }

  getItemSubtotal(index: number): number {
    const row = this.items.at(index);
    if (!row) return 0;
    const qty = Number(row.get('quantity')?.value) || 0;
    const price = Number(row.get('unit_price')?.value) || 0;
    return qty * price;
  }

  recalculateTotal(): void {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < this.items.length; i++) {
      const row = this.items.at(i);
      const qty = Number(row.get('quantity')?.value) || 0;
      const price = Number(row.get('unit_price')?.value) || 0;
      sum += qty * price;
      if (qty > 0) count += qty;
    }
    this.totalAmount.set(sum);
    this.itemsCount.set(count);
  }

  private buildPayload(): CreateBudgetRequest {
    return {
      client_name: this.budgetForm.value.client_name.trim(),
      description: (this.budgetForm.value.description || '').trim(),
      items: this.items.controls.map(ctrl => ({
        product_name: ctrl.get('product_name')?.value.trim(),
        quantity: Number(ctrl.get('quantity')?.value),
        unit_price: Number(ctrl.get('unit_price')?.value)
      }))
    };
  }

  onSubmit(): void {
    if (this.budgetForm.invalid || this.isSubmitting()) {
      this.budgetForm.markAllAsTouched();
      this.snackBar.showSnackBar('Completa los campos obligatorios del presupuesto', 'error-snackbar', 3000, 'end', 'top');
      return;
    }

    if (this.items.length === 0) {
      this.snackBar.showSnackBar('Agrega al menos un ítem al presupuesto', 'error-snackbar', 3000, 'end', 'top');
      return;
    }

    this.isSubmitting.set(true);
    const payload = this.buildPayload();

    this.budgetService.create(payload).subscribe({
      next: () => {
        this.isSaved.set(true);
        this.budgetForm.markAsPristine();
        this.snackBar.showSnackBar(`Presupuesto para "${payload.client_name}" guardado con éxito`, 'success-snackbar', 3000, 'end', 'top');
        this.router.navigate(['/budgets']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.error || err.error?.message || err.message || 'Error al guardar presupuesto';
        this.snackBar.showSnackBar(`Error: ${msg}`, 'error-snackbar', 3500, 'end', 'top');
      }
    });
  }

  saveAndDownloadPdf(): void {
    if (this.budgetForm.invalid || this.isSubmitting() || this.isDownloadingPdf()) {
      this.budgetForm.markAllAsTouched();
      this.snackBar.showSnackBar('Completa los datos del presupuesto para generar el PDF', 'error-snackbar', 3000, 'end', 'top');
      return;
    }

    if (this.items.length === 0) {
      this.snackBar.showSnackBar('Agrega al menos un ítem al presupuesto', 'error-snackbar', 3000, 'end', 'top');
      return;
    }

    this.isDownloadingPdf.set(true);
    const payload = this.buildPayload();

    this.budgetService.create(payload).subscribe({
      next: (budget) => {
        this.isSaved.set(true);
        this.budgetForm.markAsPristine();
        const budgetId = budget.id || budget.ID;
        this.budgetService.downloadPdf(budgetId).subscribe({
          next: (blob) => {
            this.isDownloadingPdf.set(false);
            const clientName = payload.client_name || 'cliente';
            this.budgetService.triggerPdfDownload(blob, `presupuesto_${clientName.toLowerCase().replace(/\s+/g, '_')}_${budgetId || 'nuevo'}.pdf`);
            this.snackBar.showSnackBar('Presupuesto guardado y PDF descargado con éxito', 'success-snackbar', 3000, 'end', 'top');
            this.router.navigate(['/budgets']);
          },
          error: () => {
            this.isDownloadingPdf.set(false);
            this.snackBar.showSnackBar('Presupuesto guardado (no se pudo generar el PDF)', 'warning-snackbar', 3500, 'end', 'top');
            this.router.navigate(['/budgets']);
          }
        });
      },
      error: (err) => {
        this.isDownloadingPdf.set(false);
        const msg = err.error?.error || err.error?.message || err.message || 'Error al guardar el presupuesto';
        this.snackBar.showSnackBar(`Error: ${msg}`, 'error-snackbar', 3500, 'end', 'top');
      }
    });
  }

  get breadcrumbs(): BreadcrumbItem[] {
    return [
      { label: 'Presupuestos', route: '/budgets' },
      { label: 'Nuevo Presupuesto' }
    ];
  }

  hasUnsavedChanges(): boolean {
    if (this.isSaved()) return false;
    return this.budgetForm.dirty;
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.isSaved() || this.isSubmitting() || this.isDownloadingPdf() || !this.hasUnsavedChanges()) {
      return true;
    }
    const dialogRef = this.dialog.open(DialogWarningComponent, {
      data: {
        title: 'Presupuesto sin guardar',
        message: 'Tienes datos o modificaciones sin guardar en el presupuesto. Si sales ahora, se perderán los cambios ingresados.',
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

  goBack(): void {
    if (this.hasUnsavedChanges() && !this.isSubmitting() && !this.isDownloadingPdf() && !this.isSaved()) {
      const dialogRef = this.dialog.open(DialogWarningComponent, {
        data: {
          title: 'Presupuesto sin guardar',
          message: 'Tienes datos o modificaciones sin guardar en el presupuesto. Si sales ahora, se perderán los cambios ingresados.',
          confirmText: 'Salir sin guardar',
          cancelText: 'Continuar editando',
          isDestructive: true,
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'confirm') {
          this.budgetForm.markAsPristine();
          this.router.navigate(['/budgets']);
        }
      });
    } else {
      this.router.navigate(['/budgets']);
    }
  }
}
