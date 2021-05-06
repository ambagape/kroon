import { AttributeGroup } from './attribute.model';

export class Product {
    id: number;
    product_id: number;
    ean: string;
    name: string;
    model: string;
    jan: string;
    image: string;
    description: string;
    meta_title: string;
    meta_description: string;

    attribute_groups: Array<AttributeGroup>;

    constructor(id: number, product_id: number, ean: string, name: string, jan: string,model: string, image: string, description: string) {
        this.id = id;
        this.product_id = product_id;
        this.ean = ean;
        this.name = name;
        this.model = model;
        this.jan = jan?jan:'1';
        this.image = image;
        this.description = description;
    }
}
