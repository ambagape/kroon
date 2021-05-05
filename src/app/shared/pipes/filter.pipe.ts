import { Pipe, PipeTransform } from '@angular/core';

import { CartItem } from '../product/cartitem.model';
import { ObservableArray } from 'tns-core-modules/data/observable-array/observable-array';

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {

    transform(source: ObservableArray<CartItem>, filterText: string): ObservableArray<CartItem> {
        if (!filterText) {
            return source;
        }

        const result: ObservableArray<CartItem> = new ObservableArray<CartItem>();
            // filterReg: RegExp = new RegExp(filterText, "i");
            const filterReg = new RegExp(`\\b${filterText}\\b`, 'i');

        source.forEach((item) => {
            if (filterReg.test(item.product.name)) {
                result.push(item);
            }
        });

        return result;
    }
}
