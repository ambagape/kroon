import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
// import { ProductRepository } from "./product/product.repository";
import { AuthRepository } from "./auth/auth.repository";
// import { OrderRepository } from "./order/order.repository";

@NgModule({
    imports: [
        HttpClientModule,
    ],
    providers: [
        // ProductRepository,
        AuthRepository,
        // OrderRepository
    ]
})

export class RepositoriesModule { }
