'use strict';

const { db } = require('./db');
const crypto = require('crypto');


exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM user WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve(false); 
      }
      else {
        const user = {id: row.id, username: row.email, name: row.name, studyplan: row.studyplan};

        crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
          if (err) reject(err);
          if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};

exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM user WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) { 
        console.log("Error :" + err);
        reject(err); 
      }
      else if (row === undefined) { 
        resolve({error: 'User not found!'}); 
      }
      else {
        const user = {id: row.id, username: row.email, name: row.name, studyplan: row.studyplan};
        resolve(user);
      }
    });
  });
};



exports.updateUserSP = (userId, value) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE user SET studyplan=? WHERE id=?';
    db.run(sql, [value, userId], function(err) {
      if(err) reject(err);
      else resolve(this.lastID);
    });
  });
}