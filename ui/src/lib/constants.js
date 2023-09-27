const Constants = {
    API_BASE_URL: "http://localhost:4000/",
    SCHOOL_NAME: "replace_me"
}

if(typeof window["GLOBAL_CONSTANTS"] == "undefined") {
    window["GLOBAL_CONSTANTS"] = Constants;
}


export default Constants
export const __DEV__ = process.env.NODE_ENV === "development";