import { Product } from './product.model';
import { Order } from './order.model';
import { User } from './user';

export interface OfferWithData {
    id: string,
    createdAt: Date,
    updatedAt: Date,
    idOffer: string,
    createBy: string,
    status: number,
    price: number,
    despacho: string,
    company: string,
    origen: string,
    estado: string,
    cantidad: number,
    idOrder: string,
    idProduct: string,
    confirmedAtAdmin: Date | null,
    confirmedAtClaimant: Date | null,
    product: Product,
    order: Order,
    commerce: User,
    workshop: User
}