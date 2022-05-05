export interface Session {
    rut: string,
    name: number,
    email: string,
    role: {
        slug: string,
        name: string
    }
    privilege: string[],
    token: string,
    cod_andes: string,
    cod_tango: string
}
