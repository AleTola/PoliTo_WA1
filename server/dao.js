'use strict'
const dayjs = require('dayjs');
const {Course} = require('./Course');
const {StudyPlan} = require('./StudyPlan');
const sqlite = require('sqlite3');
const db = new sqlite.Database('courses.sqlite', err => { if (err) throw err;});

exports.updateCourse = (code, userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE Courses SET EnrolledStudents = EnrolledStudents + 1, Students = ? WHERE Code = ?';
    db.all(sql, [userId, code], (err, rows) => {
      if(err){
          console.log(err);
          reject(err);
      }
    });
  });
};

exports.deleteStudents = (code, userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE Courses SET EnrolledStudents = EnrolledStudents - 1, Students = ? WHERE Code = ?';
    db.all(sql, [userId, code], (err, rows) => {
      if(err){
          console.log(err);
          reject(err);
      }
    });
  });
};

exports.getEnrolledStudents = (code) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Courses WHERE Code=?';
    db.get(sql, [code], (err, row) => {
      if(err){
          console.log(err);
          reject(err);
      }
      else {
        if(row != undefined) {
          const enrolledStudents = { students: row.Students ? String(row.Students) : null }
          resolve(enrolledStudents);
        }
        else resolve(undefined);
      }
    });
  });
};

exports.getCourse = (code) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Courses WHERE Code=?';
      db.get(sql, [code], (err, row) => {
        if(err){
            console.log(err);
            reject(err);
        }
        else {
          if(row != undefined) {
            const course = new Course(row.Code, row.Name, row.Credits, row.MaxStudents, row.IncompatibleWith, row.PreparatoryCourse, row.EnrolledStudents)
            resolve(course);
          }
          else resolve(undefined);
        }
      });
    });
};


exports.listCourses = () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Courses';
      db.all(sql, [], (err, rows) => {
        if(err){
            console.log(err);
            reject(err);
        }
        else {
          const courses = rows.map(row => new Course(row.Code, row.Name, row.Credits, row.MaxStudents, row.IncompatibleWith, row.PreparatoryCourse, row.EnrolledStudents));
          resolve(courses);
        }
      });
    });
};

exports.createStudyplan = (studyplan) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO StudyPlan(UserId, Full_Time, MinCredits, MaxCredits, ActualCredits, Courses) VALUES(?, ?, ?, ?, ?, ?)';
    db.run(sql, [studyplan.userId, studyplan.full_time, studyplan.minCredits, studyplan.maxCredits, studyplan.actualCredits, studyplan.courses], (err, row) => {
      if(err){
          console.log(err);
          reject(err);
      }
      else {
        resolve(this.lastID);
      }
    });
  });
};

exports.deleteStudyPlan = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM StudyPlan WHERE UserId=?';
    db.run(sql, [userId], (err) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      else resolve(null);
    });
  });
};


exports.getStudyPlan = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM StudyPlan WHERE UserId=?';
    db.get(sql, [userId], (err, row) => {
      if(err){
          console.log(err)
          reject(err)
      } else {
        if(row != undefined) {
          const studyplan = new StudyPlan(row.UserId, row.Full_Time, row.MinCredits, row.MaxCredits, row.ActualCredits, row.Courses)
          resolve(studyplan);
        } else {
          resolve(undefined);
        }
      }
    });
  });
};

exports.updateStudyplan = (userId, studyplan) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE StudyPlan SET ActualCredits=?, Courses=? WHERE UserId=?';
    db.run(sql, [studyplan.actualCredits, studyplan.courses, userId], function(err) {
      if(err) reject(err);
      else resolve(this.lastID);
    });
  });

}
