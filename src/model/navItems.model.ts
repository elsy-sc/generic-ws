import { Property } from "src/annotation/property.annotation";
import { GenModel } from "./gen.model";

export class NavItem extends GenModel{

    @Property()
    label: string;

    @Property()
    iconName: string;

    @Property()
    _to: string;

    @Property()
    parent_id: string | null;

    children?: NavItem[];

    constructor(){
        super();
    }
}