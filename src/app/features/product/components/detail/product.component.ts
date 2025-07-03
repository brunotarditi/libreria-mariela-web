import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '@features/product/service/product.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
})
export class ProductComponent implements OnInit {
  productId: string | null = null;
  selectedFile!: File;
  message: string = ''
  private route = inject(ActivatedRoute)
  private productService = inject(ProductService)
  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onImportExcel(){
    this.productService.importExcel(this.selectedFile).subscribe({
      next: (res: any) => this.message = res.message
    })
  }

  exportExcel(){
    this.productService.exportExcel().subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = 'productos.xlsx';
        a.click();
        URL.revokeObjectURL(objectUrl);
      },

    })
  }

}


