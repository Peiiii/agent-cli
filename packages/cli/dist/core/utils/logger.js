"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    info(message) {
        console.log(`[INFO] ${message}`);
    }
    error(message) {
        console.error(`[ERROR] ${message}`);
    }
    debug(message) {
        console.debug(`[DEBUG] ${message}`);
    }
    warn(message) {
        console.warn(`[WARN] ${message}`);
    }
}
exports.Logger = Logger;
