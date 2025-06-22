"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtil = void 0;
class StringUtil {
    static getClassName(filePath) {
        const parts = filePath.split('/');
        const fileName = parts[parts.length - 1];
        const className = fileName.split('.')[0];
        return StringUtil.setFirstLetterToUpperCase(className);
    }
    static setFirstLetterToUpperCase(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
exports.StringUtil = StringUtil;
//# sourceMappingURL=string.util.js.map