import { Offer } from "./offer.model";
export interface Product {
    id: string,
    idOrder: string,
    brand: string,
    model: string,
    status: number,
    //year: Date,
    //engine: string
    description: string,
    chassis: string,
    qty: number,
    offers: Offer[],
    photo: string,
}
