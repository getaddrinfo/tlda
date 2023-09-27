import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import styles from './FourOhFour.module.scss';
import { Button } from '../../components';

import { useStore } from '../../lib/store/internals';
import AuthStore from '../../lib/store/auth';

export const FourOhFour = () => {
    const navigate = useNavigate();
    const loggedIn = useStore(AuthStore, (store) => store.getLoggedIn());

    return (
        <div className={styles.fourOhFour}>
            <h1>
                404 :(
            </h1>

            <p>
                No route was found associated with that URL.
            </p>

            <div className={styles.buttons}>
                {!!loggedIn ? <Link to="/app">
                    <Button design="filled">
                        Home
                    </Button>
                </Link> : <Link to="/">
                    <Button design="filled">
                        Login
                    </Button>
                </Link>}

                    
                {/* thanks, react router v6!!! */}
                <Button design="outline" onClick={() => navigate(-1)}>
                    Go back
                </Button>
            </div>
        </div>
    )
}