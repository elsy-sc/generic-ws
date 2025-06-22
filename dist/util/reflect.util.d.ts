export declare class ReflectUtil {
    static getPropertyNames(instance: any): string[];
    static getPropertyValues(instance: any): Record<string, any>;
    static getClass(className: string): Promise<any>;
    static setPropertyValues(instance: any, values: Record<string, any>): void;
}
