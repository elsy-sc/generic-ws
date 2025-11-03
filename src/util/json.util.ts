export class JsonUtil {
    static excludeFromJson(obj: any, keysToExclude: string[]): any {
        if (obj === null || obj === undefined) {
            return obj;
        }
        const jsonObj: any = {};
        for (const key of Object.keys(obj)) {
            if (!keysToExclude.includes(key)) {
                jsonObj[key] = obj[key];
            }
        }
        return jsonObj;
    }

    static excludeFromModel<T extends object>(cls: new (...args: any[]) => T, model: T, keysToExclude: string[]): T {
        if (model === null || model === undefined) {
            return model;
        }
        const jsonObj: any = {};
        for (const key of Object.keys(model)) {
            if (!keysToExclude.includes(key)) {
                jsonObj[key] = (model as any)[key];
            }
        }
        return JsonUtil.toModel(cls, jsonObj);
    }

    static toModel<T extends object>(cls: new (...args: any[]) => T, json: any): T {
        if (json === null || json === undefined) {
            return json as any as T;
        }
        const instance = new cls();
        for (const key of Object.keys(json)) {
            if (key in instance) {
                (instance as any)[key] = json[key];
            }
        }
        return instance;
    }
}