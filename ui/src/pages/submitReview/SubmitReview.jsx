import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from "./SubmitReview.module.scss";

import { Button } from "../../components";

import SubmitReviewActionCreator from '../../lib/actions/SubmitReviewActionCreator';

const KEY_STAGES = ["KS3", "KS4", "KS5"];
const NON_NEGOTIABLES = ["challenge", "pace", "modelling", "questioning"];

const Error = ({
    item,
    touched,
    errors
}) => (
    errors[item] && touched[item] ? <span className={styles.validationError}>{errors[item]}</span> : <></>
)

const toTitle = (str) => {
    str = str.toLowerCase().split("");
    return [str[0].toUpperCase(), ...str.slice(1)].join("")
}

/**
 * 
 * @param {string} actual The currently set value
 * @param {string | undefined} value The value to set to if actual != value
 * @returns {string | undefined}
 */
const reset = (
    actual,
    value
) => actual === value ? undefined : value;

export const SubmitReview = () => {
    const { reviewId } = useParams();

    const [data, setData] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const [checked, setChecked] = useState({
        challenge: false,
        pace: false,
        modelling: false,
        questioning: false
    });

    const [studentPraise, setStudentPraise] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        SubmitReviewActionCreator.getReview(reviewId)
            .then((res) => setData(res.data))
            .catch((err) => setError(err))
    }, [reviewId]);

    if(error) {
        return <div className={styles.error}>
            <h1>Error Occurred</h1>
            <p>
                An error occurred. Please try again later.
            </p>
        </div>
    }

    if(!data) {
        return <div>
            Loading...
        </div>
    }

    if(data.reviewed) {
        return <div className={styles.error}>
            <h1>Already reviewed</h1>
            <p>
                This review has already been performed.
            </p>
            <Button onClick={() => navigate(-1)}>
                Go back
            </Button>
        </div>
    }

    return (
        <>
            {(!submitted && !error) && <div className={styles.submit}>
                <Formik
                    initialValues={SubmitReviewActionCreator.getInitialValues()}
                    onSubmit={(values, { setSubmitting }) => {
                        setSubmitting(true);
                        
                        SubmitReviewActionCreator.submit(reviewId, {
                            ...values,
                            studentFollowUp: studentPraise,
                            nonNegotiables: checked
                        })
                            .then((_) => setSubmitted(true))
                            .catch((err) => setError(err))
                            .finally(() => setSubmitting(false));
                    }}
                    validate={SubmitReviewActionCreator.getValidationRules()}
                >
                    {({
                        handleSubmit,
                        handleChange,
                        handleBlur,
                        values,
                        errors,
                        touched,
                        isSubmitting
                    }) => (
                        <form onSubmit={handleSubmit} onChange={() => console.log(values)}>
                            <div className={styles.options}>
                                <h3>What Key Stage was the lesson?</h3>
                                <ul>
                                    {KEY_STAGES.map((name) => (
                                        <li>
                                            <input
                                                name="classType"
                                                type="radio"
                                                value={name}
                                                id={`classType-${name}`}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            <label for={`classType-${name}`}>
                                                {name}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                                <Error item="classType" errors={errors} touched={touched} />
                            </div>

                            <div className={styles.options}>
                                <h3>Which non-negotiables have been met?</h3>
                                <ul>
                                    {NON_NEGOTIABLES.map((name) => (
                                        <li>
                                            <input
                                                name={`nonNegotiables.${name}`}
                                                type="radio"
                                                value={name}
                                                id={`nonNegotiable-${name}`}
                                                checked={checked[name]}
                                                defaultChecked={false}
                                                onClick={(_) => {
                                                    setChecked({
                                                        ...checked,
                                                        [name]: !checked[name]
                                                    })
                                                }}
                                            />
                                            <label for={`nonNegotiable-${name}`}>
                                                {toTitle(name)}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={styles.challenge}>
                                <h3>Describe the challenge you saw in the lesson</h3>

                                <textarea 
                                    name="challenge"
                                    value={values.challenge}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />

                                <Error item="challenge" errors={errors} touched={touched} />
                            </div>

                            <div className={styles.alignment}>
                                <h3>Describe the alignment with department goals you saw in the lesson</h3>

                                <textarea 
                                    name="alignment"
                                    value={values.alignment}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />

                                <Error item="alignment" errors={errors} touched={touched} />
                            </div>

                            <div className={styles.sen}>
                                <h3>Describe the SEN provision(s) you saw in the lesson</h3>

                                <textarea 
                                    name="sen"
                                    value={values.sen}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />

                                <Error item="sen" errors={errors} touched={touched} />
                            </div>

                            <div className={styles.sen}>
                                <h3>Describe the work quality you saw from students in the lesson</h3>

                                <textarea 
                                    name="workQuality"
                                    value={values.workQuality}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />

                                <Error item="workQuality" errors={errors} touched={touched} />
                            </div>

                            {values.classType !== "KS3" && <div className={styles.examPractice}>
                                <h3>Describe the revision practice you saw from students in the lesson</h3>

                                <textarea 
                                    name="examPractice"
                                    value={values.examPractice}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </div>}

                            <div className={styles.options}>
                                <h3>Which students should be praised for their effort in this lesson?</h3>

                                <ul>
                                    {data.students.map(({ id, name }) => (<li>
                                        <input
                                            name={`studentPraise.${id}`}
                                            type="radio"
                                            value={id}
                                            id={`studentPraise-${id}`}
                                            checked={studentPraise[id] === "praise"}
                                            defaultChecked={false}
                                            onClick={(_) => {
                                                const data = {
                                                    ...studentPraise,
                                                    [id]: reset(studentPraise[id], "praise")
                                                }

                                                setStudentPraise(data)
                                            }}
                                        />
                                        <label for={`studentPraise-${id}`}>
                                            {name}
                                        </label>
                                    </li>))}
                                </ul>
                            </div>

                            <div className={styles.options}>
                                <h3>Which students should be followed up with?</h3>

                                <ul>
                                    {data.students.map(({ id, name }) => (<li>
                                        <input
                                            name={`studentConcern.${id}`}
                                            type="radio"
                                            value={id}
                                            id={`studentConcern-${id}`}
                                            checked={studentPraise[id] === "concern"}
                                            defaultChecked={false}
                                            onClick={(_) => {
                                                const data = {
                                                    ...studentPraise,
                                                    [id]: reset(studentPraise[id], "concern")
                                                }

                                                setStudentPraise(data)
                                            }}
                                        />
                                        <label for={`studentConcern-${id}`}>
                                            {name}
                                        </label>
                                    </li>))}
                                </ul>
                            </div>

                            <div className={styles.submit}>
                                <Button disabled={isSubmitting} type="submit">
                                    Submit
                                </Button>
                            </div>
                        </form>
                    )}
                </Formik>
            </div>}
            {error && <div className={styles.error}>
                <h1>Error</h1>
                <p>
                    An unknown error occurred. Please try again later.
                </p>
                <Button onClick={() => navigate(-1)}>
                    Go back
                </Button>
            </div>}

            {submitted && <div className={styles.submitted}>
                <h1>Submitted</h1>
                <p>
                    This report will be sent to their line manager, and EVk by email, automatically.
                </p>
                <Button onClick={() => navigate(-1)}>
                    Go back
                </Button>
            </div>}
        </>
    )
}