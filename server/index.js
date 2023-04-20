'use strict'

const express = require('express');
const res = require('express/lib/response');
const morgan = require('morgan');
const cors = require('cors');

const dao = require('./dao'); // module for accessing the DB
const userDao = require('./user-dao'); // module for accessing the user DB

const {check, validationResult} = require('express-validator'); // validation middleware

// Passport-related imports
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');

// init express
let app = new express();
const port = 3001;

// set up the middlewares
app.use(morgan('dev'));
app.use(express.json());

const PORT = 3001;

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));


// Passport: set up local strategy
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await userDao.getUser(username, password)
  if(!user)
    return cb(null, false, 'Incorrect username or password.');
    
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) { // this user is id + email + name
  return cb(null, user);
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/*** StudyPlan APIs ***/

// POST /api/studyplan
app.post('/api/studyplan', async (req, res) => {

  if (Object.keys(req.body).length === 0) {
    console.log("Empty body!");
    return res.status(422).json({ error: "Empty Body" });
  }

  const studyplan = req.body;

  // Check constraint on min and max credits
  if(studyplan.actualCredits < studyplan.minCredits || studyplan.actualCredits > studyplan.maxCredits)
    res.status(500).end();

  if (studyplan === null || studyplan === undefined){
      return res.status(422).json({ error: "Empty Body" });
  }
  try {
      await dao.createStudyplan(studyplan);
      res.status(201).end();
  } catch {
      res.status(503).end();
  }
});

// DELETE /api/studyplan/:userId
app.delete('/api/studyplan/:userId',  
  [check('userId').notEmpty().isNumeric().isInt({ min: 0 })],
  async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      console.log("Validation of id failed!");
      return res.status(422).json({ errors: errors.array() });
  }

  if (!req.params) {
      console.log("Error in request parameters!");
      return res.status(422).json({ error: "Error in request parameters" });
  }
  
  const userId = parseInt(req.params.userId);
  const studyplan = await dao.getStudyPlan(userId);
  if(studyplan === undefined)
    res.status(404).json({error: `There is no Study Plan corresponding to userId:${req.params.userId}.`})

  try {
      await dao.deleteStudyPlan(userId);
      return res.status(200).end();
  } catch (err) {
      return res.status(500).end();
  }
});

// GET /api/studyplan/:userId
app.get('/api/studyplan/:userId',  
  [check('userId').notEmpty().isNumeric().isInt({ min: 0 })],
  async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      console.log("Validation of id failed!");
      return res.status(422).json({ errors: errors.array() });
  }

  if (!req.params) {
      console.log("Error in request parameters!");
      return res.status(422).json({ error: "Error in request parameters" });
  }

  const userId = parseInt(req.params.userId);

  dao.getStudyPlan(userId)
  .then(studyplan => {
    if(studyplan === undefined){
      return undefined;
    }
    else{
      res.json(studyplan);
    }
  })
  .catch((err) => res.status(500).end());
});

// GET /api/studyplan/:userId/courses
app.get('/api/studyplan/:userId/courses', 
  [check('userId').notEmpty().isNumeric().isInt({ min: 0 })],
  async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      console.log("Validation of id failed!");
      return res.status(422).json({ errors: errors.array() });
  }

  if (!req.params) {
      console.log("Error in request parameters!");
      return res.status(422).json({ error: "Error in request parameters" });
  }

  const userId = parseInt(req.params.userId);
  try {
      const studyplan = await dao.getStudyPlan(userId);

      if(studyplan === undefined)
        res.status(404).json(studyplan);

      if(studyplan.courses === null) {
        res.status(200).json(null);
      }
      const courseList = [];
      const codeList = studyplan.courses.split(',');

      for(var code of codeList){
        let course = await dao.getCourse(code);
        courseList.push(course);
      }

      res.status(200).json(courseList);
  } catch {
      res.status(500).end();
  }
});


// PUT /api/studyplan/:userId
app.put('/api/studyplan/:userId',
 [check('userId').notEmpty().isNumeric().isInt({ min: 0 })],
  async (req, res) => {

  const errors = validationResult(req);


  if (Object.keys(req.body).length === 0) {
    console.log("Empty body!");
    return res.status(422).json({ error: "Empty Body" });
  }

  if (!errors.isEmpty()) {
      console.log("Validation of id failed!");
      return res.status(422).json({ errors: errors.array() });
  }

  if (!req.params) {
      console.log("Error in request parameters!");
      return res.status(422).json({ error: "Error in request parameters" });
  }

  const userId = parseInt(req.params.userId)
  const studyplan = await dao.getStudyPlan(userId);
  if(studyplan === undefined)
    res.status(404).json({error: `There is no Study Plan corresponding to userId:${req.params.userId}.`})

  const newStudyplan = req.body;

  // Check constraint on min and max credits
  if(newStudyplan.actualCredits < newStudyplan.minCredits || newStudyplan.actualCredits > newStudyplan.maxCredits)
    res.status(500).end();

  dao.updateStudyplan(userId, newStudyplan)
  .then(() => res.status(200).end())
  .catch(() => res.status(500).end());
});

// PUT /api/studyplan/:userId/delete
app.put('/api/studyplan/:userId/delete', 
  [check('userId').notEmpty().isNumeric().isInt({ min: 0 })],
  async (req, res) => {

  const errors = validationResult(req);


  if (Object.keys(req.body).length === 0) {
    console.log("Empty body!");
    return res.status(422).json({ error: "Empty Body" });
  }

  if (!errors.isEmpty()) {
      console.log("Validation of id failed!");
      return res.status(422).json({ errors: errors.array() });
  }

  if (!req.params) {
      console.log("Error in request parameters!");
      return res.status(422).json({ error: "Error in request parameters" });
  }

  const userId = parseInt(req.params.userId)
  const studyplan = await dao.getStudyPlan(userId);
  if(studyplan === undefined)
    res.status(404).json({error: `There is no Study Plan corresponding to userId:${req.params.userId}.`})

  const course = req.body.course;
  const credits = req.body.credits;

  const courseList = studyplan.courses.split(',');

  if(courseList.includes(course)) {

    const index = courseList.indexOf(course);
    courseList.splice(index, 1);

    studyplan.actualCredits = studyplan.actualCredits - credits;
    studyplan.courses = courseList.join(",").toString();

  }

  // Check constraint on min and max credits
  if(studyplan.actualCredits < studyplan.minCredits || studyplan.actualCredits > studyplan.maxCredits)
    res.status(500).end();
  
  try {
    await dao.updateStudyplan(studyplan);
    res.status(200).end();
  }
  catch(err) {
    console.error(err);
    res.status(503).json({error: `Database error while updating ${newStudyplan.userId}.`});
  }
});

/*** Course APIs (4)***/

// POST /api/courses
app.post('/api/courses', async (req, res) => {

  if (Object.keys(req.body).length === 0) {
    console.log("Empty body!");
    return res.status(422).json({ error: "Empty Body" });
  }

  const course = req.body;

  if (course === null || course === undefined || course.length === 0){
      return res.status(422).end();
  }
  try {
      await dao.createCourse(course);
      res.status(201).end();
  } catch {
      res.status(503).end();
  }
});

// GET /api/courses
app.get('/api/courses', async (req, res) => {
  try{
      const courses = await dao.listCourses();

      res.status(200).json(courses);
  }catch{
      res.status(500).end();
  }
});

// PUT /api/courses
app.put('/api/courses', async (req, res) => {
  try{

    if (Object.keys(req.body).length === 0) {
      console.log("Empty body!");
      return res.status(422).json({ error: "Empty Body" });
    }

    const courses = req.body.courses;
    const coursesList = courses.split(',');

    coursesList.forEach(async code => {

      // Check if this course exist in the DB
      const getCourse = await dao.getCourse(code);
      if(getCourse === undefined)
        res.status(500).end();

      // Check if this student is already enrolled in this course
      const userId = String(req.body.userId);
      const students = await dao.getEnrolledStudents(code);

      if(students.students === undefined || students.students === null) {
        dao.updateCourse(code, userId);
      }
      else {
        if(!students.students.split(',').includes(userId))
          dao.updateCourse(code, students.students + ',' + userId);
      }
      
    });
    res.status(200).end();
  }catch{
    res.status(500).end();
  }
});


// PUT /api/courses/delete
app.put('/api/courses/delete', async (req, res) => {
  try{

    if (Object.keys(req.body).length === 0) {
      console.log("Empty body!");
      return res.status(422).json({ error: "Empty Body" });
    }

    const courses = req.body.courses;
    const coursesList = courses.split(',');

    coursesList.forEach(async code => {

      // Check if this course exist in the DB
      const getCourse = await dao.getCourse(code);
      if(getCourse === undefined)
        res.status(500).end();

      const userId = String(req.body.userId);
      // Get students enrolled in this course
      const studentsJson = await dao.getEnrolledStudents(code);

      if(studentsJson.students != null) {
        const studList = studentsJson.students.split(',');
        const index = studList.indexOf(userId);
        if (index > -1) {
          studList.splice(index, 1);
        }
        dao.deleteStudents(code, studList.join(',') ? studList.join(',') : null);
      } else {
        console.log("Error in split 400");
      }
    });
    res.status(200).end();
  }catch{
    res.status(500).end();
  }
});



// ---------- USER ------------ (5) //

// POST /api/sessions
app.post('/api/sessions', passport.authenticate('local'), (req, res) => {
  res.status(201).json(req.user);
});

// GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/sessions/current
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// PUT /api/user/:userId
app.put('/api/user/:userId', 
  [check('userId').notEmpty().isNumeric().isInt({ min: 0 })],
  async (req, res) => {

  const errors = validationResult(req);

  if (Object.keys(req.body).length === 0) {
    console.log("Empty body!");
    return res.status(422).json({ error: "Empty Body" });
  }

  if (!errors.isEmpty()) {
      console.log("Validation of id failed!");
      return res.status(422).json({ errors: errors.array() });
  }

  if (!req.params) {
      console.log("Error in request parameters!");
      return res.status(422).json({ error: "Error in request parameters" });
  }

  const userId = parseInt(req.params.userId);
  const value = req.body.value;
  try {
    await userDao.updateUserSP(userId, value);
    res.status(200).end();
  }
  catch(err) {
    console.error(err);
    res.status(503).json({error: `Database error while updating ${filmToUpdate.title}.`});
  }
});

// GET /api/user/:userId
app.get('/api/user/:userId', 
  [check('userId').notEmpty().isNumeric().isInt({ min: 0 })],
  async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      console.log("Validation of id failed!");
      return res.status(422).json({ errors: errors.array() });
  }

  if (!req.params) {
      console.log("Error in request parameters!");
      return res.status(422).json({ error: "Error in request parameters" });
  }

  const userId = parseInt(req.params.userId);
  try{
      const user = await userDao.getUserById(userId);
      res.status(200).json(user);
  }catch{
      res.status(500).end();
  }
});


app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}/`));