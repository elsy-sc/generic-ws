import { ReflectUtil } from "./reflect.util";

export class GenUtil{
    static toModelPropertiesCase(object: Object, rows: Record<string, any>[]): Record<string, any>[] {
        const modelProps = ReflectUtil.getPropertyNames(object);
        const propMap: Record<string, string> = {};
        for (const prop of modelProps) {
            propMap[prop.toLowerCase()] = prop;
        }
        return rows.map(row => {
            const mapped: any = {};
            for (const key in row) {
                mapped[propMap[key.toLowerCase()] || key] = row[key];
            }
            return mapped;
        });
    }
}
