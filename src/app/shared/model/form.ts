import {Question} from './question';

export interface Form {
    createdBy: string;
    slug: string;
    title: string;
    description: string;
    customer: string;
    ot: string;
    group: string;
    status: number;
    createdAt: string;
    publishAt: string;
    vigencyAt: string;
    suspendAt: string;
    deleteAt: string;
    questions: Question[];
}
