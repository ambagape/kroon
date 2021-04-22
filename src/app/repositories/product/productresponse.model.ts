import { Product } from "../../shared/product/product.model";

export class ProductResponse {
  status: ProductResponseStatus;
  product: Product;
  ean: string;
}

export enum ProductResponseStatus {
  Error = 'error',
  Success = 'success',
  Offline = 'offline'
}
