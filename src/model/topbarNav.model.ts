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

    async read(afterWhere?: string, client?: any, limit?: number, offset?: number): Promise<Object[]> {
        const items = await super.read(afterWhere, client, limit, offset) as TopbarNav[];
        items.forEach(item => {
            item.children = items.filter(child => child.parent_id === item.id);
        });
        return items.filter(item => item.parent_id == null);    
    }
}