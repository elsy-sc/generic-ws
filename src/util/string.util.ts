export class StringUtil {

    static getClassName(filePath: string) : string {
        const parts = filePath.split('/');
        const fileName = parts[parts.length - 1];
        const className = fileName.split('.')[0];
        return StringUtil.setFirstLetterToUpperCase(className);
    }

    static setFirstLetterToUpperCase(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}