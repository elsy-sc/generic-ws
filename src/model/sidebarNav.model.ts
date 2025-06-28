import { Property } from "src/annotation/property.annotation";
import { NavItem } from "./navItems.module";
import { Sequence } from "src/annotation/sequence.annotation";

export class SidebarNav extends NavItem{
    @Property()
    @Sequence({ name: 'sidebar_nav_seq', prefix: 'SDB' })
    id: string;

    constructor() {
        super();
        this.setTableName('sidebarnav');
    }
}