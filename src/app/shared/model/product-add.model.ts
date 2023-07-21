import { Offer } from "./offer.model";

export interface ProductAdd {
    idOrder: string,
    title: string,
    qty: number,
    createBy: string,
    company: string,
    status: number,
    offer: Offer[],
}
