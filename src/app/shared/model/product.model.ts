import { Offer } from "./offer.model";
export interface Product {
    id: string,
    idOrder: string,
    title: string,
    qty: number,
    createBy: string,
    company: string,
    status: number,
    offer: Offer[],
}
