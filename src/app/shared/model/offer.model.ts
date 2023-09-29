import { Order } from "./order.model";
import { Product } from "./product.model";
export interface Offer {
    id?:string,
    createdAt?: Date,
    updatedAt?: Date,
    idOffer: string,
    createBy: string,
    company: string,
    status: number,
    price: number,
    photo?: string,
    despacho: string,
    qty: number,
    qtyOfferAccepted: number,
    commission: number,
    comentario?: string,
    make?: string,
    estado: string,
    origen: string,
    idOrder: string,
    idProduct: string,
    timerVigency?: Date | null,
    timerPaymentWorkshop?: Date | null,
    count?: number;
    countSeconds?: number;
    countMinutes?: number;
    product?: Product[],
    order?: Order[]
}
