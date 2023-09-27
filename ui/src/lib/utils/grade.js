/**
 * 
 * @param {number} grade 
 * @param {string[]} boundaries 
 * @param {number[]} grades 
 * @returns 
 */
export const getGrade = (grade, boundaries, grades) => {
    if (grade < boundaries[boundaries.length - 1]) {
        return "Fail"
    }

    const idx = boundaries.findIndex((value) => value <= grade);

    return grades[idx] ?? "N/A";
}