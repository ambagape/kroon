import { Product } from './product.model';
import { ProductResponseStatus } from '../../repositories/product/productresponse.model';

export class CartItem {
    offline: boolean;
    exists = true;
    product: Product;
    quantity: number;
    ean: string;

    static for(status: ProductResponseStatus, product: Product, ean: string): CartItem {
        switch (status) {
            case 'success':
                return {
                    offline: false,
                    exists: true,
                    product,
                    quantity: 1,
                    ean
                };
            case 'offline':
                return {
                    offline: true,
                    exists: true,
                    product: null,
                    quantity: 1,
                    ean
                };
            case 'error':
                return {
                    offline: false,
                    exists: false,
                    product: null,
                    quantity: null,
                    ean
                };
            default:
                return null;
        }
    }
}
