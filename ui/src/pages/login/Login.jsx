import React from "react";
import { Navigate as Redirect, useLocation } from "react-router-dom"
import { Formik } from 'formik';

import { useStore } from "../../lib/store/internals";
import AuthStore from "../../lib/store/auth";
import Constants from "../../lib/constants";

import styles from './Login.module.scss';
import { Button } from "../../components";
import { validate, minStrLen, mustMatch } from "../../lib/formValidator";
import AuthActionCreator from "../../lib/actions/AuthActionCreator";


const Login = () => {
    const location = useLocation();
    const loggedIn = useStore(AuthStore, (store) => store.getLoggedIn());
    const [globalErrorMessage, setGlobalErrorMessage] = React.useState(null);

    // If we are already logged in, try these steps
    if(loggedIn) {
        // If we logged in with a return_url, try returning to that
        const redirectTo = new URLSearchParams(location.search).get("return_url");

        if(redirectTo) {
            try {
                return <Redirect to={redirectTo} />
            } catch {}
        }

        // otherwise, fallback to the app home page.
        return <Redirect to="/app" />
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Login</h2>
                <img src="/branding/logo-small.png" alt={Constants.SCHOOL_NAME} className={styles.logo} />
            </div>
            {!!globalErrorMessage && <div className={styles.failure}>
                <p>{globalErrorMessage}</p>    
            </div>}
            <Formik
                initialValues={{ email: '', password: '' }}
                validate={validate([
                    {
                        key: 'email',
                        required: true,
                        handle: mustMatch(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "Invalid email address")
                    },
                    {
                        key: 'password',
                        required: true,
                        handle: minStrLen(8)
                    }
                ])}
                onSubmit={(values, { setSubmitting }) => {
                    if(!values) return;

                    AuthActionCreator.login(
                        values.email,
                        values.password
                    )
                        .catch((err) => setGlobalErrorMessage(err))
                        .finally(() => {
                            setSubmitting(false);
                        });
                }}  
            >
                {({
                    values,
                    errors,
                    touched,
                    isSubmitting,
                    handleSubmit,
                    handleChange,
                    handleBlur
                }) => (
                    <form onSubmit={handleSubmit} className={styles.form} onChange={() => setGlobalErrorMessage(null)}>
                        <div className={styles.inputWrapper}>
                            <input 
                                placeholder="Email"
                                type="email"
                                name="email"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.email}
                            />
                            {/* If there are errors in our email, and the user has touched the email field, show the error*/}
                            <span className={styles.error}>{errors.email && touched.email && errors.email[0]}</span>
                        </div>
                        <div className={styles.inputWrapper}>
                            <input
                                placeholder="Password"
                                type="password"
                                name="password"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.password}
                            />
                            <span className={styles.error}>{errors.password && touched.password && errors.password[0]}</span>
                        </div>
                        <Button design="filled" type="submit" disabled={isSubmitting}>
                            Submit
                        </Button>
                    </form>
                )}
            </Formik>
        </div>
    )
}

export default Login;