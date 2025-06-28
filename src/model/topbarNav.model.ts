import { Property } from "src/annotation/property.annotation";
import { NavItem } from "./navItems.module";
import { Sequence } from "src/annotation/sequence.annotation";

export class TopbarNav extends NavItem{
    @Property()
    @Sequence({ name: 'topbar_nav_seq', prefix: 'TPB' })
    id: string;

    constructor() {
        super();
        this.setTableName('topbarnav');
    }
}