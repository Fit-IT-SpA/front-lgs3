import { SparePart } from "./sparePart.model";
import { Offer } from "./offer.model";
export interface Order {
    idOrder: string,
    createBy: string,
    company: string,
    sparePart: SparePart,
    productName: string,
    productBrand: string,
    productDetails: string,
    status: number,
    offers: Offer[],
    limitPrice: number,
    qty: number,
    photo: string,
    closingDate: Date,
    
}
