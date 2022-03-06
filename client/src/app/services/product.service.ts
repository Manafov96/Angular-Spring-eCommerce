import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../common/product';
import { map } from 'rxjs/operators'
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productUrl = "http://localhost:8080/api/products";

  private categoryUrl = "http://localhost:8080/api/product-category";

  constructor(private httpClient: HttpClient) { }

  public getProductList(theCategoryId: number): Observable<Product[]> {
    const searchUrl = `${this.productUrl}/search/findByCategoryId?id=${theCategoryId}`;
    return this.getProducts(searchUrl);
  }

  public getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }

  public searchProducts(theKeyword: string): Observable<Product[]> {
    const searchUrl = `${this.productUrl}/search/findByNameContaining?name=${theKeyword}`;
    return this.getProducts(searchUrl);
  }

  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProduct>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

  public getProduct(theProductId: number): Observable<Product> {
    // need to build URL based on product id
    const productUrl = `${this.productUrl}/${theProductId}`
    return this.httpClient.get<Product>(productUrl);
  }

  public getProductListPaginate(thePage: number, thePageSize: number, theCategoryId: number): Observable<GetResponseProduct> {
    // need to build URL based on category id, page, size
    const searchUrl = `${this.productUrl}/search/findByCategoryId?id=${theCategoryId}`
      + `&page=${thePage}&size=${thePageSize}`;
    return this.httpClient.get<GetResponseProduct>(searchUrl);
  }

  public searchProductsPaginate(thePage: number, thePageSize: number, theKeyword: string): Observable<GetResponseProduct> {
    // need to build URL based on category id, page, size
    const searchUrl = `${this.productUrl}/search/findByNameContaining?name=${theKeyword}`
      + `&page=${thePage}&size=${thePageSize}`;
    return this.httpClient.get<GetResponseProduct>(searchUrl);
  }

}

interface GetResponseProduct {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }
}
