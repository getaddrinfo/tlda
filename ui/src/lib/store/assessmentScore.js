import { Dispatcher, Store, ActionTypes } from "./internals";

export const SYMBOL_NO_SCORE = Symbol("score.null");
export const SYMBOL_NO_MARKER = Symbol("marker.null");

export const FLAGS = {
    "SEN": 1 << 0,
    "Missed Assessment": 1 << 1,
};

export const ALL_FLAGS = [...Object.keys(FLAGS)];

/*
This store manages the state of submitting scores 
for an assessment. It stores state about scores
/markers/flags and internal state such as if
certain dropdowns are open
*/

let _scores = null;
let _data = null;
let _showWarning = false;
let _globalHasDropdownOpen = false;


class AssessmentScoreStore extends Store {
    alreadyFetched(id) {
        return _data?.id === id;
    }

    countProgress() {
        const res = this.getResults();

        const len = (fn) => res.filter(fn).length;
        const setTeachers = len((data) => data.markerId !== SYMBOL_NO_MARKER);
        const setScores = len((data) => data.score !== SYMBOL_NO_SCORE);
        const total = len(() => true);

        return {
            combined: {
                present: setTeachers + setScores, 
                total: 2 * total
            },
            teachers: {
                present: setTeachers, 
                total: total
            },
            scores: {
                present: setScores, 
                total: total
            },
        }
    }

    getData() {
        if(!_data) return null;

        return {
            id: _data.id,
            name: _data.name,
            type: _data.type,
            grading: {
                maxMarks: _data.max_marks,
                boundaries: _data.grade_boundaries,
                system: _data.grading_system.data
            },
            options: {
                class: _data.class ?? null,
                year: _data.year ?? null,
                department: _data.department ?? null
            },
            meta: {
                hasScores: _data.has_scores,
                canSubmitScores: _data.can_submit_scores
            },
            numStudents: _data.students.length,
        }
    }

    getShowWarning() {
        return _showWarning;
    }

    getCanSubmit() {
        const res = this.getResults();

        const len = (fn) => res.filter(fn).length;
        const eq = (value) => value === res.length

        const setTeachers = len((data) => data.markerId !== SYMBOL_NO_MARKER);
        const setScores = len((data) => data.score !== SYMBOL_NO_SCORE);

        return eq(setScores) && eq(setTeachers);
    }

    getResults() {
        if(!_scores) return [];

        return Object.entries(_scores)
            .map(([id, data]) => ({
                id,
                name: data.name,
                score: data.score,
                markerId: data.markerId,
                flags: [...data.flags],
                dropdowns: {
                    flag: data.flagDropdownOpen,
                    teacher: data.teacherDropdownOpen
                }
            }));
    }

    getSerializedResult() {
        if(!_scores) return [];

        return Object.entries(_scores)
            .map(([id, data]) => ({
                student_id: id,
                marker_id: data.markerId,
                score: data.score,
                flags: [...data.flags]
                    .map((flag) => FLAGS[flag])
                    .reduce((acc, curr) => acc | curr, 0)
            }))
    }
}

export default new AssessmentScoreStore(Dispatcher, {
    [ActionTypes.ASSESSMENT_SCORE_FETCH_SUCCESS]: ({ data }) => {
        _data = data;
        _scores = {};

        for(const entry of data.students) {
            _scores[entry.id] = {
                // ui data
                name: entry.name,
                score: SYMBOL_NO_SCORE,
                markerId: SYMBOL_NO_MARKER,
                flags: new Set([]),
                
                // dropdowns
                flagDropdownOpen: false,
                teacherDropdownOpen: false
            }
        }
    },
    [ActionTypes.ASSESSMENT_SCORE_SET_STUDENT_SCORE]: ({ id, score }) => {
        if(!_scores[id]) return;

        if(score > _data.max_marks) {
            score = _data.max_marks;
            _showWarning = true;
        }

        _scores[id].score = score;
    },
    [ActionTypes.ASSESSMENT_SCORE_SET_MARKER]: ({ studentId, markerId }) => {
        if(!_scores[studentId]) return;
        _scores[studentId].markerId = markerId;
        _scores[studentId].teacherDropdownOpen = false;
        _globalHasDropdownOpen = false;
    },
    [ActionTypes.ASSESSMENT_SCORE_CLEAR_STUDENT_SCORE]: ({ id }) => {
        if(!_scores[id]) return;

        _scores[id].score = SYMBOL_NO_SCORE;
    },
    [ActionTypes.ASSESSMENT_SCORE_ADD_STUDENT_SCORE_FLAG]: ({ id, flag }) => {
        if(!_scores[id]) return;
        _scores[id].flags.add(flag);
        _scores[id].flagDropdownOpen = false;
        _globalHasDropdownOpen = false;
    },
    [ActionTypes.ASSESSMENT_SCORE_REMOVE_STUDENT_SCORE_FLAG]: ({ id, flag }) => {
        if(!_scores[id]) return;
        _scores[id].flags.delete(flag);
    },
    [ActionTypes.ASSESSMENT_SCORE_DISMISS_WARNING]: (_) => {
        _showWarning = false;
    },
    [ActionTypes.ASSESSMENT_SCORE_OPEN_FLAG_DROPDOWN]: ({ id }) => {
        if(!_scores[id] || _globalHasDropdownOpen) return;
        _scores[id].flagDropdownOpen = true;
        _globalHasDropdownOpen = true;
    },
    [ActionTypes.ASSESSMENT_SCORE_OPEN_TEACHER_DROPDOWN]: ({ id }) => {
        if(!_scores[id] || _globalHasDropdownOpen) return;
        _scores[id].teacherDropdownOpen = true;
        _globalHasDropdownOpen = true;
    },
    [ActionTypes.ASSESSMENT_SCORE_CLOSE_TEACHER_DROPDOWN]: ({ id }) => {
        if(!_scores[id]) return;
        _scores[id].teacherDropdownOpen = false;
        _globalHasDropdownOpen = false;
    },
    [ActionTypes.ASSESSMENT_SCORE_SET_MARKER_ALL]: ({ markerId, studentId }) => {
        for(const id of Object.keys(_scores)) {
            _scores[id].markerId = markerId;
        }

        if(!_scores[studentId]) return;
        _scores[studentId].teacherDropdownOpen = false;
        _globalHasDropdownOpen = false;
    }
})
