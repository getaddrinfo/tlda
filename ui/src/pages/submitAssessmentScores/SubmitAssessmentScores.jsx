import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components';
import AssessmentScoreStore, { ALL_FLAGS, SYMBOL_NO_MARKER, SYMBOL_NO_SCORE } from '../../lib/store/assessmentScore';
import { useStore } from '../../lib/store/internals';
import TeacherSearchStore from '../../lib/store/teacherSearch';

import styles from './SubmitAssessmentScores.module.scss';

import AssessmentScoreActionCreator from '../../lib/actions/AssessmentScoreActionCreator';


const getYear = (finalYear) => {
    const d = new Date();
    return 11 - (finalYear - d.getFullYear());
}

const getTitle = ({
    class: cls,
    department,
    year
}) => cls ? cls.code : `${department.name} - Y${getYear(year.final_year)}`;

/**
 * Returns the complement (opposite) to 
 * the provided set of flags
 * 
 * @param {string[]} flags Currently set flags
 * @returns {string[]} The complement
 */
const getUnsetFlags = (flags) => {
    const out = [];
    for(const flag of ALL_FLAGS) {
        if(!flags.includes(flag)) {
            out.push(flag)
        }
    }

    return out;
}

const Flag = ({
    name,
    studentId
}) => (
    <span className={styles.flag}>
        {name}

        <button onClick={() => AssessmentScoreActionCreator.removeFlag({ id: studentId, flag: name })}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="12" height="12"><path fill-rule="evenodd" d="M1.757 10.243a6 6 0 118.486-8.486 6 6 0 01-8.486 8.486zM6 4.763l-2-2L2.763 4l2 2-2 2L4 9.237l2-2 2 2L9.237 8l-2-2 2-2L8 2.763l-2 2z"></path></svg> 
        </button>
    </span>
)

/**
 * 
 * @param {number} grade 
 * @param {string[]} boundaries 
 * @param {number[]} grades 
 * @returns 
 */
const getGrade = (grade, boundaries, grades) => {
    if(grade === SYMBOL_NO_SCORE) return "Not set"
    if(grade < boundaries[boundaries.length - 1]) {
        return "Fail"
    }

    const idx = boundaries.findIndex((value) => value <= grade);

    return grades[idx] ?? "N/A";
}

export function SubmitAssessmentScores() {
    const { assessmentId } = useParams();
    const { data, students, progress, showWarning, canSubmit } = useStore(AssessmentScoreStore, (store) => ({
        data: store.getData(),
        students: store.getResults(),
        progress: store.countProgress(),
        canSubmit: store.getCanSubmit(),
        showWarning: store.getShowWarning(),
    }), {
        skip: true
    });

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const {
        combined,
        teachers: teacherCounts,
        scores
    } = progress;



    const teachers = useStore(TeacherSearchStore, (store) => store.getResults(), { skip: true });
    let applyAll = false;

    useEffect(() => {
        AssessmentScoreActionCreator.fetchAssessment(assessmentId);
    }, [assessmentId]);

    if(!data) {
        return <>Loading...</>
    }

    if(submitted) {
        return <div className={styles.notice}>
            <h1>Submitted</h1>
            <p>
                You can view the results <Link to={`/app/assessments/${assessmentId}`}>here</Link>
            </p>
        </div>
    }

    const {
        grading,
        options,
        meta,
    } = data;

    const title = getTitle(options);

    if(meta.hasScores) {
        return <div className={styles.notice}>
            <h1>This assessment already has scores</h1>
            <p>
                You cannot submit scores for this assessment, but you can view them <Link to={`/app/assessments/${assessmentId}`}>here</Link>
            </p>
        </div>
    }

    if(!meta.canSubmitScores) {
        return <div className={styles.notice}>
            <h1>You cannot submit scores for this assessment</h1>
            <p>
                You aren't the department lead, or you don't teach the class that this assessment is for.
            </p>
        </div> 
    }

    return (
        <div className={styles.submitAssessmentScores}>
            <div className={styles.header}>
                <h1>{data.name} ({title})</h1>

                <div>
                    <span>Max marks: {grading.maxMarks}</span>
                </div>
            </div>

            {showWarning && <div className={styles.warning}>
                <p>Maximum mark is {data.grading.maxMarks}. Are you sure your data is correct?</p>
                <Button design='grey' onClick={() => { AssessmentScoreActionCreator.dismissWarning() }}>
                    Dismiss
                </Button>
            </div>}

            {error && <div className={styles.error}>
                <p>An error occurred submitting the data ({ error })</p>
                <Button design='grey' onClick={() => { setError(null) }}>
                    Dismiss
                </Button>
            </div>}
            
            <div className={styles.withSidebar}>
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Score</th>
                            <th>Grade</th>
                            <th>Marker</th>
                            <th>Flags</th>
                        </tr>
                    </thead>
                    <tbody>
                    {students.map((student) => (
                        <tr key={student.id}>
                            <td className={styles.student}>{student.name}</td>
                            <td className={styles.mark}>
                                <input 
                                    type='number' 
                                    max={grading.maxMarks} 
                                    value={student.score === SYMBOL_NO_SCORE ? undefined : student.score}
                                    min={0} 
                                    placeholder='Mark'
                                    onChange={(e) => {
                                        if(e.target.value === "") {
                                            AssessmentScoreActionCreator.clearScore(student.id);
                                            return
                                        }

                                        AssessmentScoreActionCreator.setScore({
                                            studentId: student.id,
                                            score: e.target.valueAsNumber
                                        });
                                }} />
                            </td>
                            <td className={styles.grade}>
                                {getGrade(
                                    students.find((data) => data.id === student.id)?.score ?? SYMBOL_NO_SCORE,
                                    grading.boundaries,
                                    grading.system
                                )}
                            </td>
                            <td className={styles.marker}>
                                <input 
                                    type="text" 
                                    placeholder='Search' 
                                    value={student.markerId !== SYMBOL_NO_MARKER ? TeacherSearchStore.getTeacher(student.markerId)?.name : undefined}
                                    onChange={(event) => {
                                        AssessmentScoreActionCreator.changeTeacherSearchFilter({ 
                                            filter: event.target.value
                                        });
                                    }}
                                    onFocus={() => {
                                        AssessmentScoreActionCreator.openTeacherDropdown(student.id);
                                    }}
                                />

                                <div className={[styles.selectTeacherDropdown, student.dropdowns.teacher ? styles.teacherOpen : null].filter(Boolean).join(" ")}>
                                    <ul>
                                        {teachers.map(({ id, name }) => (
                                            <li onClick={() => {
                                                AssessmentScoreActionCreator.setMarker({
                                                    studentId: student.id,
                                                    markerId: id,
                                                    all: applyAll
                                                });

                                                applyAll = false;
                                            }}>
                                                <span className={styles.name}>{name}</span>
                                                <Button size='small' onClick={() => { applyAll = true }}>
                                                    Apply for all
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </td>
                            <td className={styles.flags}>
                                {student.flags.map((name) => <Flag name={name} studentId={student.id} key={name} />)}
                                {getUnsetFlags(student.flags).length !== 0 && <span className={styles.addFlag} onClick={() => {
                                    AssessmentScoreActionCreator.openFlagDropdown(student.id);
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M13.25 2.5H2.75a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25V2.75a.25.25 0 00-.25-.25zM2.75 1h10.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0113.25 15H2.75A1.75 1.75 0 011 13.25V2.75C1 1.784 1.784 1 2.75 1zM8 4a.75.75 0 01.75.75v2.5h2.5a.75.75 0 010 1.5h-2.5v2.5a.75.75 0 01-1.5 0v-2.5h-2.5a.75.75 0 010-1.5h2.5v-2.5A.75.75 0 018 4z"></path></svg>
                                </span>}

                                <div className={[styles.selectFlagDropdown, student.dropdowns.flag ? styles.flagOpen : ""].filter(Boolean).join(" ")}>
                                    <ul>
                                        {getUnsetFlags(student.flags).map((flag) => (
                                            <li key={flag.toLowerCase()} onClick={() => {
                                                AssessmentScoreActionCreator.addFlag({
                                                    id: student.id,
                                                    flag
                                                });
                                            }}>
                                                {flag}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div className={styles.sidebar}>
                    <h1>Overview</h1>
                    <progress 
                        className={[styles.assessmentMarkProgress, canSubmit ? styles.complete : null].filter(Boolean).join(" ")} 
                        value={combined.present} 
                        max={combined.total} 
                    />
                    <ul className={styles.meta}>
                        <li key="class" className={canSubmit ? styles.isFull : ""}>
                            <b>{combined.present} of {combined.total} entered</b>

                            <p>
                                {teacherCounts.present} of {teacherCounts.total} markers set
                            </p>
                            <p>
                                {scores.present} of {scores.total} scores set
                            </p>
                        </li>
                        <li key="grades">
                            <h3>Grade Boundaries</h3>
                            <ul>
                                <li key="maxMarks">
                                    Maximum: {grading.maxMarks}
                                </li>
                                {grading.system.map((grade, idx) => (
                                    <li key={`grade-${idx}`}>
                                        {grade} - {grading.boundaries[idx]}
                                    </li>
                                ))}
                            </ul>
                        </li>
                        <li className={styles.submit} key="submit">
                            <Button design={canSubmit ? 'filled' : 'grey'} className={styles.submit} disabled={!canSubmit} onClick={() => {
                                AssessmentScoreActionCreator.submit()
                                    .then((_) => setSubmitted(true))
                                    .catch((err) => setError(err?.response?.data?.message ?? "Unknown Error"));
                            }}>
                                Submit
                            </Button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}