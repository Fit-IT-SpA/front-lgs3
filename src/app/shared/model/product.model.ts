import { Offer } from "./offer.model";
export interface Product {
    id: string,
    idOrder: string,
    brand: string,
    model: string,
    status: number,
    //year: Date,
    //engine: string
    createBy: string,
    company: string,
    description: string,
    chassis: string,
    qty: number,
    offers: Offer[],
    offer: Offer[],
    photo: string,
}
