import { Offer } from "./offer.model";
export interface Product {
    id: string,
    idOrder: string,
    title: string,
    qty: number,
    originalQty: number,
    createBy: string,
    company: string,
    status: number,
}
