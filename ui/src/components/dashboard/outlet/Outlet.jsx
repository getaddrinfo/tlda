import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import logger from '../../../lib/logger';
import Dispatcher from '../../../lib/store';
import { ActionTypes } from '../../../lib/store/internals';
import http from '../../../lib/http';

import { Navbar } from '../navbar/Navbar';
import styles from './Outlet.module.scss';

export const DashboardOutlet = () => {
    useEffect(() => {  
        Dispatcher.dispatch({ type: ActionTypes.USER_FETCH_START });
    
        http.get("/users/@me")
            .then((res) => {
                Dispatcher.dispatch({
                    type: ActionTypes.USER_FETCH_SUCCESS,
                    ...res.data
                });
            })
            .catch((err) => {
                logger.error(err);
                Dispatcher.dispatch({ type: ActionTypes.USER_FETCH_FAILURE })
            })
    }, []);

    return (
        <>
            <Navbar />
            <div className={styles.wrapper}>
                <Outlet />
            </div>
        </>
    )
}