import http from '../http';
import { arrayAll, arrayAllValuesMustBeUnique, arrayMustBeSorted, arrayValueCannotExceedMaximum, integerMinValue, validate } from "../../lib/formValidator"

/**
 * Serializes the form data
 * into a payload for the
 * api
 */
const serializeCreateAssessmentArguments = ({
    target,
    name,
    yearId = null,
    gradingSystem,
    maxMark,
    boundary
}) => {
    let data;

    if (target.startsWith("dep_")) {
        data = {
            type: 'year',
            year_id: yearId,
            department_id: target
        }
    } else {
        data = {
            type: 'class',
            class_id: target
        }
    }

    return {
        ...data,
        name,
        max_marks: maxMark,
        grading: {
            system_id: gradingSystem,
            boundaries: boundary
        },
    }
}

const AssessmentActionCreator = {
    async getConstructs() {
        return await http.get("/assessments/constructs");
    },
    async createAssessment(values) {
        return await http.post('/assessments', serializeCreateAssessmentArguments(values))
    },

    validator() {
        return validate([
            {
                key: 'boundary',
                handle: arrayMustBeSorted()
            },
            {
                key: 'boundary',
                handle: arrayAllValuesMustBeUnique()
            },
            {
                key: 'boundary',
                handle: arrayValueCannotExceedMaximum('maxMark')
            },
            {
                key: 'boundary',
                handle: arrayAll((v) => v >= 0, "All values must be greater than or equal to 0")
            },
            {
                key: 'maxMark',
                handle: integerMinValue(1)
            },
            {
                key: 'name',
                handle: (value) => {
                    if (value) return;
                    return "Must be specified"
                }
            }
        ])
    },

    getInitialValues() {
        return {
            target: "",
            name: "",
            yearId: "",
            gradingSystem: "",
            maxMark: "",
            boundary: []
        }
    }
}

export default AssessmentActionCreator;