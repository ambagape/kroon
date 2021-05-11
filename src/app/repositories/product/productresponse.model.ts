import { Product } from '../../shared/product/product.model';

export class ProductResponse {
  status: ProductResponseStatus;
  product: Product;
  ean: string;
}

export enum ProductResponseStatus {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Error = 'error',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Success = 'success',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Offline = 'offline'
}
