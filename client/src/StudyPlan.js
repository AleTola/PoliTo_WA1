'use strict';

/**
 * Constructor function for new Film objects
 * @param {integer} userId
 * @param {integer} credits
 * @param {integer} minCredits
 * @param {integer} maxCredits
 * @param {integer} actualCredits
 * @param {string} Courses
 */
function StudyPlan (userId, full_time, minCredits, maxCredits, actualCredits, courses) {
    this.userId = userId;
    this.full_time = full_time;
    this.minCredits = minCredits;
    this.maxCredits = maxCredits;
    this.actualCredits = actualCredits;
    this.courses = courses;
}

exports.StudyPlan = StudyPlan;