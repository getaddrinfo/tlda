import { __DEV__ } from "./constants";

const STYLE = `font-weight: bold;color: rgb(0, 121, 188);`;

if(__DEV__) {
    console.log(
        "%cREMEMBER:",
        "font-weight:bold;color:#ff0000;",
        "double logs of react hooks occurs in development mode when using React.StrictMode"
    );
    console.log(
        "this is %cnot",
        "font-weight:bold;",
        "a fault in your code"
    )
}

class Logger {
    constructor(name) {
        this._name = name || "default"

        for(const level of ["log", "info", "warn", "error", "trace", "debug"]) {
            this[level] = this[level].bind(this);
        }
    }

    log(level, ...args) {
        console[level || 'log'](`%c[${this._name}]`, STYLE, ...args);
    }

    // TODO: use dev flags to gate this
    debug(...args) {
        if(__DEV__) {
            console.debug(`%c[${this._name}]`, STYLE, ...args)
        }
    }

    info(...args) {
        this.log("info", ...args);
    }

    warn(...args) {
        this.log("warn", ...args)
    }

    error(...args) {
        this.log("error", ...args)
    }

    trace(...args) {
        this.log("trace", ...args)
    }
}


// eslint-disable-next-line
const def = new Logger();

// eslint-disable-next-line
export default {
    create: (name) => new Logger(name),
    log: def.log,
    info: def.info,
    warn: def.warn,
    error: def.error,
    trace: def.trace,
    debug: def.debug
}
