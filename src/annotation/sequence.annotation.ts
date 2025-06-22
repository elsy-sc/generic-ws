
export function Sequence({ name, prefix }: { name?: string; prefix?: string }) {
    return function (target: any, propertyKey: string) {
        if (name) Reflect.defineMetadata('sequenceName', name, target, propertyKey);
        if (prefix) Reflect.defineMetadata('sequencePrefix', prefix, target, propertyKey);
    };
}

export function getSequenceName(target: any): string | undefined {
    for (const key of Object.getOwnPropertyNames(target)) {
        const name = Reflect.getMetadata('sequenceName', target, key);
        if (name) return name;
    }
    return undefined;
}

export function getSequencePrefix(target: any): string | undefined {
    for (const key of Object.getOwnPropertyNames(target)) {
        const prefix = Reflect.getMetadata('sequencePrefix', target, key);
        if (prefix) return prefix;
    }
    return undefined;
}
