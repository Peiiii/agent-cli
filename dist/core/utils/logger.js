export class Logger {
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
