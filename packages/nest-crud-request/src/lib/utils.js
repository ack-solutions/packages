"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepMerge = deepMerge;
function deepMerge(target, source) {
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], deepMerge(target[key], source[key]));
        }
    }
    return {
        ...target,
        ...source,
    };
}
//# sourceMappingURL=utils.js.map