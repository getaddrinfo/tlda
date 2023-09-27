import React from 'react';
import { Navigate as Redirect, Outlet, useLocation } from 'react-router-dom';

import { useStore } from '../../lib/store/internals'
import AuthStore from '../../lib/store/auth';
import Logger from '../logger';

const logger = Logger.create("AssertAuthenticated");

export const AssertAuthenticated = () => {
    const location = useLocation()
    const loggedIn = useStore(AuthStore, (store) => store.getLoggedIn());

    if(!loggedIn) {
        logger.debug("unauthenticated");
        const params = new URLSearchParams();
        params.append("return_url", location.pathname + location.search + location.hash);

        return (
            <Redirect to={"/?" + params.toString()} />
        )
    }

    logger.debug("authenticated");


    return (
        <Outlet />
    )
}

