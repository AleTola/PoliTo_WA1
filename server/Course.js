'use strict';

/**
 * Constructor function for new Film objects
 * @param {string} code
 * @param {string} name
 * @param {integer} credits
 * @param {integer} maxStudents
 * @param {string} incompWith
 * @param {string} prepCourse
 * @param {integer} prepCourse
 */
function Course (code, name, credits, maxStudents, incompWith, prepCourse, enrStud) {
    this.code = code;
    this.name = name;
    this.credits = credits;
    this.maxStudents = maxStudents;
    this.incompWith = incompWith;
    this.prepCourse = prepCourse;
    this.enrStud = enrStud;
}

exports.Course = Course;