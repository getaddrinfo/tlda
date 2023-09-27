import http from "../http"
import { createFetchAction } from "../store/internals/Fetcher"

const UserProfileActionCreator = {
    async fetch(id) {
        return createFetchAction(
            () => http.get(`/users/${id}/profile`),
            "USER_PROFILE"
        );
    }
}

export default UserProfileActionCreator;