export interface Offer {
    id?:string,
    idOffer: string,
    createBy: string,
    company: string,
    status: number,
    price: number,
    photo?: string,
    despacho: string,
    cantidad: number,
    comentario?: string,
    estado: string,
    origen: string,
    idOrder: string,
    idProduct: string
}
