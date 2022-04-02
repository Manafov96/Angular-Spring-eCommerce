import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { LoginComponent } from './components/login/login.component';
import { MembersPageComponent } from './components/members-page/members-page.component';

import {
  OktaAuthGuard,
  OktaCallbackComponent
} from '@okta/okta-angular';

const routes: Routes = [
  { path: 'login/callback', component: OktaCallbackComponent },
  { path: 'login', component: LoginComponent },
  { path: 'members', component: MembersPageComponent, canActivate: [OktaAuthGuard] },

  { path: "search/:keyword", component: ProductListComponent },
  { path: "category/:id", component: ProductListComponent },
  { path: "category", component: ProductListComponent },
  { path: "products", component: ProductListComponent },
  { path: "products/:id", component: ProductDetailsComponent },
  { path: "cart-details", component: CartDetailsComponent },
  { path: "checkout", component: CheckoutComponent },
  { path: "", redirectTo: '/products', pathMatch: 'full' },
  { path: "**", redirectTo: '/products', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
