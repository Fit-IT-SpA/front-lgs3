import { Offer } from "./offer.model";
import { Order } from "./order.model";
export interface ProductWithData {
    id: string,
    idOrder: string,
    title: string,
    qty: number,
    originalQty: number,
    createBy: string,
    company: string,
    status: number,
    offer?: Offer[],
    order?: Order,
}
