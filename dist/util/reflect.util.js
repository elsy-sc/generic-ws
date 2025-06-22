"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReflectUtil = void 0;
const string_util_1 = require("./string.util");
class ReflectUtil {
    static getPropertyNames(instance) {
        const props = [];
        let obj = instance;
        while (obj && obj !== Object.prototype) {
            props.push(...Object.getOwnPropertyNames(obj));
            obj = Object.getPrototypeOf(obj);
        }
        return Array.from(new Set(props))
            .filter((prop) => typeof instance[prop] !== 'function'
            && prop !== 'constructor');
    }
    static getPropertyValues(instance) {
        const properties = ReflectUtil.getPropertyNames(instance);
        const values = {};
        for (const prop of properties) {
            const value = instance[prop];
            if (value !== undefined && value !== null) {
                values[prop.toLowerCase()] = value;
            }
        }
        return values;
    }
    static async getClass(className) {
        try {
            const modulePath = `../${className.toLowerCase()}`;
            const module = await Promise.resolve(`${modulePath}`).then(s => require(s));
            const exportName = string_util_1.StringUtil.getClassName(modulePath);
            if (!module[exportName]) {
                throw new Error(`Export ${exportName} not found in module ${modulePath}`);
            }
            return module[exportName];
        }
        catch (error) {
            throw new Error(`Class ${className} not found: ${error.message}`);
        }
    }
    static setPropertyValues(instance, values) {
        const properties = ReflectUtil.getPropertyNames(instance);
        for (const prop of properties) {
            const matchingKey = Object.keys(values).find(key => key.toLowerCase() === prop.toLowerCase());
            if (matchingKey) {
                const originalProp = Object.getOwnPropertyNames(instance).find(p => p.toLowerCase() === prop.toLowerCase()) || prop;
                instance[originalProp] = values[matchingKey];
            }
        }
    }
}
exports.ReflectUtil = ReflectUtil;
//# sourceMappingURL=reflect.util.js.map