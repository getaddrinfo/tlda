import axios from "axios";
import Logger from "./logger";
import Constants from "./constants"

import AuthStore from "./store/auth";

const logger = Logger.create("http");

const client = new axios.create({
    baseURL: Constants.API_BASE_URL
})

client.interceptors.request.use((request) => {
    // TODO: attach auth to our request, if present.

    if(AuthStore.getLoggedIn()) {
        request.headers["Authorization"] = "Bearer " + AuthStore.getToken();
    }

    logger.info(
        `${request.method} ${request.url}`,
        {
            data: request.data,
        }
    );

    return request;
});

client.interceptors.response.use(
    (response) => {
        logger.debug("response received", {
            url: response.config.url,
            method: response.config.method,
            status: response.status
        });

        return response;
    },
    (error) => {
        logger.error("response received", {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status
        });

        return Promise.reject(error);
    }
)

logger.info("initialized");

// eslint-disable-next-line
export default {
    client: client,
    get: client.get.bind(client),
    post: client.post.bind(client),
    patch: client.patch.bind(client),
    put: client.put.bind(client),
    delete: client.delete.bind(client)
}

