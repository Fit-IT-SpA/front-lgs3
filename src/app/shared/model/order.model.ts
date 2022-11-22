import { SparePart } from "./sparePart.model";

export interface Order {
    idOrder: string,
    createBy: string,
    company: string,
    sparePart: SparePart,
    productName: string,
    productBrand: string,
    productDetails: string,
    status: number,
    offers: string[],
    limitPrice: number,
    qty: number,
    photo: string,
    closingDate: Date,
    
}
