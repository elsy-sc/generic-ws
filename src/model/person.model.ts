import { Property } from "src/annotation/property.annotation";
import { Sequence } from "src/annotation/sequence.annotation";
import { GenModel } from "./gen.model";

export class Person extends GenModel {
    @Sequence({ name: 'user_seq', prefix: 'PERS' })
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
        super();
    }
}