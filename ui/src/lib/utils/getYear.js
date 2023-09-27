/**
 * Calculates what year (7 -> 11) a year is
 * based on their final year.
 * @param {number} finalYear 
 * @returns {number}
 */
const getYear = (finalYear) => {
    const d = new Date();
    return 11 - (finalYear - d.getFullYear());
}

export default getYear;