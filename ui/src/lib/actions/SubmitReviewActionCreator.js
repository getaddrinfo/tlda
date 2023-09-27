import http from '../http';
import { minStrLen, mustBeOneOf, validate } from "../../lib/formValidator"


/**
 * Serializes the form data
 * into a payload for the
 * api
 * 
 * @param {{
 *   nonNegotiables: {
 *     challenge: boolean,
 *     pace: boolean,
 *     modelling: boolean,
 *     questioning: boolean
 *   },
 *   challenge: string,
 *   alignment: string,
 *   sen: string,
 *   workQuality: string,
 *   classType: string,
 *   examPractice?: string,
 *   studentFollowup: {
 *     [key: string]: "praise" | "concern" | undefined
 *   }
 * }} data
 * @returns {any}
 */
const serialize = ({
    challenge,
    alignment,
    sen,
    workQuality,
    classType,
    examPractice,
    nonNegotiables,
    studentFollowup
}) => {
    // All the IDs of students that were
    // marked as praise
    const praise = Object.entries(studentFollowup)
        .filter(([_, value]) => value === "praise")
        .map(([id, _]) => id);

    // All the IDs of students that were
    // marked as concern
    const concern = Object.entries(studentFollowup)
        .filter(([_, value]) =>  value === "concern")
        .map(([id, _]) => id);
    

    return {
        non_negotiables: nonNegotiables,
        commentary: {
            students: {
                challenge: challenge,
                alignment: alignment,
                sen: sen,
                work_quality: workQuality
            },
            class: classType === "KS3" ? {
                type: "ks3"
            } : {
                type: classType.toLowerCase(),
                exam_practice_quality: examPractice
            }
        },
        followup: {
            praise,
            concern
        }
    }
}

const SubmitReviewActionCreator = {
    async getReview(id) {
        return await http.get(`/reviews/${id}`)
    },

    async submit(reviewId, {
        nonNegotiables,
        studentFollowUp,
        challenge,
        alignment,
        sen,
        workQuality,
        classType,
        examPractice
    }) {
        return await http.post(`/reviews/${reviewId}`, serialize({
            nonNegotiables,
            studentFollowup: studentFollowUp,
            challenge,
            alignment,
            sen,
            workQuality,
            classType,
            examPractice
        }))
    },

    getValidationRules() {
        return validate([
            {
                key: "classType",
                handle: mustBeOneOf([
                    "KS3",
                    "KS4",
                    "KS5"
                ])
            },
            {
                key: "challenge",
                handle: minStrLen(100)
            },
            {
                key: "alignment",
                handle: minStrLen(100)
            },
            {
                key: "sen",
                handle: minStrLen(100)
            },
            {
                key: "workQuality",
                handle: minStrLen(100)
            }
        ])
    },

    getInitialValues() {
        return {
            challenge: "",
            alignment: "",
            sen: "",
            workQuality: "",
            classType: "",
            examPractice: undefined
        }
    }
}

export default SubmitReviewActionCreator;