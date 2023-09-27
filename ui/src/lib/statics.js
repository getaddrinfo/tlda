import http from "./http";
import logger from "./logger";


export let CLASSROOMS;

(async function() {
    CLASSROOMS = await http.get("/static/classrooms.json")
        .then((res) => res.data)
        .catch((err) => {
            logger.error(err);
        });
})()