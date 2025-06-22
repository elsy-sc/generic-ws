import { Property } from "src/annotation/property.annotation";
import { GenModel } from "./gen.model";

export class Person extends GenModel{
    @Property()
    public id: string;
    @Property()
    public firstName: string;
    @Property()
    public lastName: string;
    @Property()
    public email: string;
    @Property()
    public phone: string;

    constructor() {
        super('user_seq', 'PERS');
    }
}