import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from "./CreateAssessment.module.scss";

import { Button } from "../../components";
import AssessmentActionCreator from '../../lib/actions/AssessmentActionCreator';

import { Error } from "../../components/common";
import { Tag } from "../../components/assessment/create";

import getYear from "../../lib/utils/getYear";
import toTitle from '../../lib/utils/toTitle';

export const CreateAssessment = () => {
    const [data, setData] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        AssessmentActionCreator.getConstructs()
            .then((res) => setData(res.data))
            .catch((err) => setError(err?.response?.data?.message ?? "Unknown Error"))
    }, [])

    if(!data) {
        return <>Loading...</>
    }

    return (
        <>
            <div className={styles.submit}>
                {error && <div className={styles.error}>
                    <p>An error occurred while handling the assessment ({ error })</p>    
                    <Button design='grey' onClick={() => setError(null)}>Dismiss</Button>
                </div>}

                {!submitted && <Formik
                    initialValues={AssessmentActionCreator.getInitialValues()}
                    onSubmit={(values, { setSubmitting }) => {
                        setSubmitting(true);

                        AssessmentActionCreator.createAssessment(values)
                            .then((res) => {
                                setSubmitted(true);
                                setData(res.data)
                            })
                            .catch((err) => setError(err?.response?.data?.message ?? "Unknown Error"))
                            .finally(() => setSubmitting(false));
                    }}
                    validate={AssessmentActionCreator.validator()}
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
                            <div className={styles.text}>
                                <h3>What is the name of the assessment?</h3>
                                <input 
                                    type='text'
                                    name='name'
                                    placeholder='Enter a name'
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.name}
                                />
                                <Error item='name' errors={errors} touched={touched} />

                            </div>
                            
                            <div className={styles.options}>
                                <h3>Who is the assessment for?</h3>
                                <ul>
                                    {data.targets
                                        .filter((data) => data.type !== 'year')
                                        .map(({ id, name, type }) => (
                                            <li>
                                                <input
                                                    name='target'
                                                    type="radio"
                                                    value={id}
                                                    id={`target-${id}`}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                                <label for={`target-${id}`}>
                                                    <span>{toTitle(name)}</span>
                                                    <Tag inner={toTitle(type)} />
                                                </label>
                                            </li>
                                        ))}
                                </ul>
                            </div>

                            {values.target?.startsWith("dep_") && <div className={styles.options}>
                                <h3>What year is the assessment for?</h3>
                                <ul>
                                    {data.targets.filter((data) => data.type === 'year').map(({ id, name, type }) => (
                                        <li>
                                            <input
                                                name='yearId'
                                                type="radio"
                                                value={id}
                                                id={`year-${id}`}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            <label for={`year-${id}`}>
                                                <span>Year {getYear(name)}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>}

                            <div className={styles.options}>
                                <h3>What grading system should be used?</h3>

                                <ul>
                                    {data.grading_systems.map(({ id, name }) => (<li>
                                        <input
                                            name={`gradingSystem`}
                                            type="radio"
                                            value={id}
                                            id={`gradingSystem-${id}`}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        <label for={`gradingSystem-${id}`}>
                                            {name}
                                        </label>
                                    </li>))}
                                </ul>

                                <Error item='gradingSystem' errors={errors} touched={touched} />
                            </div>

                            <div className={styles.integer}>
                                <h3>What is the maximum mark of the assessment</h3>

                                <input 
                                    type='number'
                                    name='maxMark'
                                    value={values.maxMark}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    min={1}
                                />

                                <Error item='maxMark' errors={errors} touched={touched} />
                            </div>

                            {values.gradingSystem !== "" && values.maxMark !== "" && <div className={styles.gradeBoundaries}>
                                <h3>What are the grade boundaries for this assessment?</h3>

                                <table>
                                    <thead>
                                        <tr>
                                            <th>Grade</th>
                                            <th>Boundary</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.grading_systems.find(({ id }) => id === values.gradingSystem).data.map((value, idx) => (
                                            <tr key={idx}>
                                                <td className={styles.grade}>
                                                    {value}
                                                </td>
                                                <td>
                                                    <input 
                                                        type='number'
                                                        name={`boundary.${idx}`}
                                                        placeholder='Enter boundary'
                                                        max={values.maxMark}
                                                        value={values.boundary[idx]}
                                                        min={0}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <Error item='boundary' errors={errors} touched={touched} />
                            </div>}

                            <div className={styles.submit}>
                                <Button disabled={isSubmitting} type="submit">
                                    Submit
                                </Button>
                            </div>
                        </form>
                    )}
                </Formik>}

                {submitted && <div className={styles.submitted}>
                    <h1>Submitted</h1>
                    <p>
                        You can submit grades once the assessment is finished <Link to={`/app/assessments/${data.id}/submit`}>here</Link>.
                    </p>
                    <Button onClick={() => navigate(-1)}>
                        Go back
                    </Button>
                </div>}
            </div>
        </>
    )
}