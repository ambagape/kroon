import { AttributeGroup } from './attribute.model';

export class Product {
    id: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
    product_id: number;
    ean: string;
    name: string;
    model: string;
    jan: string;
    image: string;
    description: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
    meta_title: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
    meta_description: string;

  // eslint-disable-next-line @typescript-eslint/naming-convention
    attribute_groups: Array<AttributeGroup>;

  // eslint-disable-next-line @typescript-eslint/naming-convention
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
