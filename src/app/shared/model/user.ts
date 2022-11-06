import {Companies} from './companies.model'
export interface User {
    email: string,
    role: string,
    name: string,
    lastName: string,
    secondLastName: string,
    status: number,
    failedAttempts: number,
    companies: Companies[]
}
