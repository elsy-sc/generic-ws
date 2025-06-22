import { GenModel } from "./gen.model";

export class Person extends GenModel{
    public id: string;
    public firstName: string;
    public lastName: string;
    public email: string;
    public phone: string;

    constructor() {
        super('user_seq', 'PERS');
    }
}