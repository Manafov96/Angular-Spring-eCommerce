import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  public products: Product[] = [];

  public currentCategoryId: number = 1;

  public searchMode: boolean = false;

  // properties for paination
  public thePageNumber: number = 1;

  public thePageSize: number = 5;

  public theTotalElements: number = 0;

  private previuosCategoryId: number = 1;

  private previousKeyword: string = '';

  constructor(private productService: ProductService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    })
  }

  public listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');
    if (this.searchMode) {
      this.handleSearchProducts();
    }
    else {
      this.handleListProducts();
    }
  }

  private handleListProducts() {
    // check id param
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');
    if (hasCategoryId) {
      // get the "id". conver string to a number using the '+' symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    }
    else {
      // not category available ... default to category id 1
      this.currentCategoryId = 1;
    }
    // Check if we have different category than previous
    // Note: Angular will resuse component if it is currently being viewed

    // if we have a different category id than previous
    // the set thePageNumber back to 1
    if (this.previuosCategoryId! - this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previuosCategoryId = this.currentCategoryId;

    // now get the products for the given category id
    this.productService.getProductListPaginate(this.thePageNumber - 1, this.thePageSize, this.currentCategoryId).subscribe(
      this.processResult()
    );
  }

  private processResult() {
    return (data: { _embedded: { products: Product[]; }; page: { number: number; size: number; totalElements: number; }; }) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }

  private handleSearchProducts() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword') || '';
    // if we have different keyword than previous
    // then set thePageNumber to 1
    if(this.previousKeyword != theKeyword) {
      this.thePageNumber = 1;
    }
    this.previousKeyword = theKeyword;
    // now search for the product using keyword
    this.productService.searchProductsPaginate(this.thePageNumber - 1, this.thePageSize, theKeyword).subscribe(
      this.processResult()
    );
  }

  public updatePageSize(event: any) {
    const pageSize = event.target.value;
    this.thePageSize = pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

}
