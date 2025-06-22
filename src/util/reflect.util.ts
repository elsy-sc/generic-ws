import { StringUtil } from "./string.util";

export class ReflectUtil {

    static getPropertyNames(instance: any): string[] {
        const props: string[] = [];
        let obj = instance;
        while (obj && obj !== Object.prototype) {
            props.push(...Object.getOwnPropertyNames(obj));
            obj = Object.getPrototypeOf(obj);
        }
        
        return Array.from(new Set(props))
            .filter(
                (prop) => typeof instance[prop] !== 'function' 
                && prop !== 'constructor'
            );
    }

    static getPropertyValues(instance: any): Record<string, any> {
        const properties = ReflectUtil.getPropertyNames(instance);
        const values: Record<string, any> = {};
        for (const prop of properties) {
            const value = instance[prop];
            if (value !== undefined && value !== null) {
                values[prop.toLowerCase()] = value;
            }
        }
        return values;
    }

    static async getClass(className: string): Promise<any> {
    try {
        const modulePath = `../${className.toLowerCase()}`;
        const module = await import(modulePath);
        
        const exportName = StringUtil.getClassName(modulePath);
        
        if (!module[exportName]) {
            throw new Error(`Export ${exportName} not found in module ${modulePath}`);
        }
        return module[exportName];
        } catch (error) {
            throw new Error(`Class ${className} not found: ${error.message}`);
        }
    }

    static setPropertyValues(instance: any, values: Record<string, any>): void {
        const properties = ReflectUtil.getPropertyNames(instance);
        for (const prop of properties) {
            const matchingKey = Object.keys(values).find(key => 
                key.toLowerCase() === prop.toLowerCase()
            );
            
            if (matchingKey) {
                const originalProp = Object.getOwnPropertyNames(instance).find(p => 
                    p.toLowerCase() === prop.toLowerCase()
                ) || prop;
                instance[originalProp] = values[matchingKey];
            }
        }
    }
}
