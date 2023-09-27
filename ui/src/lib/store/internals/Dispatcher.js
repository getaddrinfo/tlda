import Logger from "../../logger";
import { __DEV__ } from "../../constants";
import { Store } from "./Store";
const Dispatched = require("dispatched");


const logger = Logger.create("Dispatcher")

class Dispatcher extends Dispatched.Dispatcher {
    constructor() {
        super();

        this._start = null;
        this._onFinishCallbacks = [];
    }

    dispatch(payload) {
        logger.debug(`dispatch ${payload.type}`, payload);
        super.dispatch(payload);
    }

    /**
     * For if we want to dispatch an action
     * immediately. Can cause performance issues.
     */
    dirty(payload) {
        if(__DEV__) {
            logger.warn("Dispatcher#dirty: May have unintended performance effects");
        }

        if(!this.isDispatching()) {
            return this.dispatch(payload)
        }

        setImmediate(this.dispatch.bind(this, payload));
    }

    /**
     * Only dispatches if possible.
     */
    maybe(payload) {
        if(!this.isDispatching()) {
            this.dispatch(payload)
        }
    }

    /**
     * 
     * Custom begin logic:
     * - Sets start time in msec
     */
    begin(payload) {
        this._start = Date.now();
        super.begin(payload);
    }



    /**
     * Custom finish logic:
     * - Emits store changes
     * - Logs time taken.
     * - Runs callbacks
     */
    finish() {
        try {
            // Run all the callbacks that need to be ran
            logger.debug("emitting store changes");
            Store.emit();
        } catch(err) {
            logger.error(err);
        } finally {
            // Do proper cleanup code, prep for next dispatch cycle
            super.finish();
        }

        for(const callback of this._onFinishCallbacks) {
            try { callback(); } catch {}
        }

        const elapsed = Date.now() - this._start;
        // If it took a long time, log using warn
        const method = elapsed > 100 ? "warn" : "info"
        logger[method](`dispatch: took ${elapsed}ms`);
    }

    /** Attaches a callback that is ran when the Dispatcher has finished dispatching */
    onFinish(callback) {
        this._onFinishCallbacks.push(callback);
        const remove = () => this._onFinishCallbacks.splice(
            this._onFinishCallbacks.indexOf(callback),
            1
        );

        return { remove }
    }
}

const d = new Dispatcher();
window["Dispatcher"] = d;
export default d;