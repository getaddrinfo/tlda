import { __DEV__ } from "../../constants";
import Logger from "../../logger";

const _emitOnceFinished = new Set();
const _all = new Set();

const staticLogger = Logger.create("StoreManager");

export class Store { 
    /**
     * 
     * @param {import("./Dispatcher").Dispatcher} dispatcher 
     */
    constructor(
        dispatcher,
        handlers
    ) {
        this.handlers = handlers;
        this.dispatcher = dispatcher;
        this.dependencies = [];
        this.listeners = [];

        // We create a logger based on the name of the class.
        // This value will be correct in classes that extend it,
        // e.g., AuthStore, which will result in logs somewhat
        // like: [AuthStore] handling ACTION: {data}
        this.logger = Logger.create(this.constructor.name);

        if(__DEV__) {
            window[`store__${this.constructor.name}`] = this;
        }


        this.token = dispatcher.register((action) => {
            // If this store has dependencies, we should wait for them 
            // to resolve first.
            if(this.dependencies.length > 0) {
                dispatcher.waitFor(this.dependencies);
            }
            
            // Find the function that is assigned to handle this
            // callback.
            const func = this.handlers[action.type];

            // If there is no function to run, then it must not
            // be handled by this store.
            if(!func) return;

            this.logger.debug(`handling ${action.type}`, action);

            // do the mutation
            func(action);

            // if there are listeners, cause the callbacks to be called.
            if(this.listeners.length > 0) {
                _emitOnceFinished.add(this);
            }
        });
        
        // Add the store to the global list of all stores
        _all.add(this);
    }

    emit() {
        // For each listener, call it.
        for(const listener of this.listeners) {
            listener();
        }
    }

    static emit() {
        staticLogger.debug("emit: stores =", _emitOnceFinished.size)

        // Call all the listeners for the updated stores
        _emitOnceFinished.forEach((v) => v.emit());

        // And then clear the set.
        _emitOnceFinished.clear();
    }
    
    addListener(listener) {
        this.listeners.push(listener);
    }

    removeListener(listener) {
        this.listeners = this.listeners.filter((v) => v !== listener);
    }

    hasDependency(store) {
        if(!(store instanceof Store)) {
            throw new Error("Store#addDependency: store must be instanceof Store")
        }

        return this.dependencies.includes(store.token);
    }

    addDependency(store) {
        if(!(store instanceof Store)) {
            throw new Error("Store#addDependency: store must be instanceof Store")
        }

        this.dependencies.push(store.token);
    }

    removeDependency(store) {
        if(!(store instanceof Store)) {
            throw new Error("Store#removeDependency: store must be instanceof Store")
        }

        this.dependencies = this.dependencies.filter((v) => v !== store.token);
    }

    initialize() {
        // abstract
    }

    __initialize() {
        this.initialize();
        this.logger.info("initialized");
    }

    getDispatcher() {
        return this.dispatcher;
    }

    getDispatchToken() {
        return this.token;
    }

    static initialize() {
        staticLogger.info("initializing");

        // ensure all stores are registered
        require("./init");

        // calls initialize on each store.
        _all.forEach((store) => store.__initialize());
        staticLogger.info("initialized");
    }
}
