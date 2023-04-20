import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CourseRoute, DefaultRoute, LoginRoute, StudyPlanRoute } from './components/CourseViews';

import API from './API';
import { Container, Row, Alert } from 'react-bootstrap';

function App() {
  const [courses, setCourses] = useState([]);
  const [SPcourses, setSPcourses] = useState([]);
  const [studyPlan, setStudyPlan] = useState(undefined);

  const [showDetails, setShowDetails] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(-1);
  const [userHaveSP, setUserHaveSP] = useState(false);


  const getCourses = async () => {
    const _courses = await API.getAllCourses();
    setCourses(_courses);
  }

  const getSPcourses = async () => {
    if(user.id !== -1) {
      const _SPcourses = await API.getStudyPlanCourses(user.id);
      if(_SPcourses !== null)
        setSPcourses(_SPcourses);
    }
  }

  const checkAuth = async () => {
    try {
      const user_info = await API.getUserInfo(); // we have the user info here
      if(user_info !== undefined) {
        if(loggedIn === false) 
          setLoggedIn(true);

        const userSP = await API.getUserById(user_info.id)
        setUser(userSP);

        // Check if this user has already a studyplan 
        if(userSP.studyplan === 1){
          // get Study Plan
          const studyplan = await API.getStudyPlan(userSP.id); 
          setUserHaveSP(true);
          setStudyPlan(studyplan);

          // get Study Plan courses
          const _SPcourses = await API.getStudyPlanCourses(userSP.id);
          if(_SPcourses !== null)
            setSPcourses(_SPcourses);
        }
      }
    }
    catch {
      console.log("Error in Check Authorization ")
    }
  };

  useEffect(() => {
    checkAuth();
    getCourses();
  }, []);


  useEffect(() => {
    getCourses();
    if(loggedIn === true)
      checkAuth(); 
  }, [loggedIn]);


  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setMessage({msg: `Welcome, ${user.name}!`, type: 'success'});
      setShowDetails([]);
    } catch(err) {
      setMessage({msg: err, type: 'danger'});
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUserHaveSP(false);

    // clean up everything
    setCourses([]);
    setStudyPlan(null); 
    setSPcourses([]); 
    setShowDetails([]);
    setMessage('');
  };

  // MY FUNCTIONS

  const checkConstarainsAdd = async (course) => {
    // Check incompatible courses
    const incList = SPcourses.filter(e => {
      let list = [];
      if(e.incompWith !== null && e.incompWith !== undefined) {
        list = e.incompWith.split(',');
        if(list[0] === course.code || list[1] === course.code)
          return true;
        else
          return false;
      }
    });

    // This course can't be added to the studyplan
    if(incList.length !== 0){
      return 1;
    }

    // Check preparatory course
    if(course.prepCourse !== null) {
      if(SPcourses.filter(e => e.code === course.prepCourse).length === 0) {
        return 2;
      }
    }
    return true;
  }


  const addCourseToSP = async (userId, course) => {

    let totCredits = 0;
    let courses = []
    if(SPcourses !== null && SPcourses !== []) {
      courses = Array.from(SPcourses);
      if (courses[0] !== null) {
        for(let i=0; i< courses.length; i++) {
          totCredits += courses[i].credits;
        }
      }
    }

    const pushCourse = {code: course.code, name: course.name, credits: course.credits, maxStudents: course.maxStudents, 
      incompWith: course.incompWith, prepCourse: course.prepCourse};

    // Check contrsains on prep course and incomp course
    const notAdd = await checkConstarainsAdd(course);
    if(notAdd === 1) {
      setMessage({msg: `You can not add this course to the study plan. It is not compatible with the course ${course.incompWith} in your studyplan`, type: 'danger'});
      return false;
    }

    if(notAdd === 2) {
      setMessage({msg: `You can not add this course to the study plan. You have to add before its preparatory course ${course.prepCourse}!`, type: 'danger'});
      return false;
    }

    // Check if the number of enrolld students is respected
    if(course.maxStudents !== null && course.maxStudents < course.enrStud + 1){
      setMessage({msg: 'You can not insert this course. There are too many students enrolled!', type: 'danger'});
      return false;
    }

    // If this is the first course added to the Study Plan
    if(SPcourses[0] == null || SPcourses === null) {
      // Add this course to the SP courses
      setSPcourses(oldCourses => [...oldCourses, pushCourse]);
      return true;
    }

     // If this is NOT the first course added to the Study Plan
    if(SPcourses.filter(e => e.code === course.code).length === 0) {
       
      // if the course credits don't break the "max credits constraint"
      if(parseInt(studyPlan.maxCredits) >= (parseInt(totCredits) + parseInt(course.credits))) {
        // Add this course to the SP courses
        setSPcourses(oldCourses => [...oldCourses, pushCourse]);
      }
      else {
        setMessage({msg: 'You can not insert any other course. Too many credits!', type: 'danger'});
      }
    }
  }

  const checkConstarainsDelete = async (course) => {
    // Check if this course is a <preparatory course> for one course of the study plan
    if(SPcourses.filter(e => e.prepCourse === course.code).length !== 0) {
      return false;
    }
    return true;
  }

  const deleteCourseToSP = async (userId, course) => {
    // Check if this course can be deleted form the study plan
    const notDelete = await checkConstarainsDelete(course);

    if(notDelete === false){
      setMessage({msg: 'You can not delete this course to the study plan.', type: 'danger'});
      return false;
    }

    // Remove the course from the SP courses   
    const index = SPcourses.indexOf(course);
    SPcourses.splice(index, 1);

    setSPcourses(oldCourses => {
      return oldCourses.map(c => {
        if(c.code !== course.code)
        return c;
      })
    })
  }

  const addStudyPlan = async (studyplan) => {
    // Set the variable use state 'studyPlan' to this new studyplan
    setStudyPlan(studyplan);

    // Set the variable use state 'userHaveSP' to true (the user have a study plan)
    setUserHaveSP(true); 
  }

  const cancelStudyPlan = async () => {
    // Set the SP courses to a empty list
    setSPcourses([]);
    // Get from the DB the SP courses from the previous study plan that has not been modified persistently
    getSPcourses(); 

    if(SPcourses === null || SPcourses === []) {
      // Get from the DB the study plan that has not been modified persistently
      const studyplan = await API.getStudyPlan(user.id); // non so se serve
      // Set the variable use state 'studyPlan' to the old, not modified studyplan
      setStudyPlan(studyplan);
    }
  }

  const saveStudyPlan = async () => {

    const courses = SPcourses.map(e => e.code).join(",").toString();
    const credits = SPcourses.reduce((sum ,a) => sum + a.credits, 0);

    const studyplan = {userId: studyPlan.userId, full_time: studyPlan.full_time, minCredits: studyPlan.minCredits,
       maxCredits: studyPlan.maxCredits, actualCredits: credits, courses: courses}

    if(studyPlan.full_time) {
      if(credits >= 60 && credits <= 80) {
        // Remove from the table courses the previously enrolled student
        if(studyPlan.courses !== null)
          await API.deleteSPcourses(user.id, studyPlan.courses);
        // If there is no study plan in the DB I create a new one, otherwisw I update the existing one
        if(user.studyplan === 1) 
          await API.updateStudyPlan(user.id, studyplan);
        else {
          await API.updateUserSP(user.id, 1);
          await API.addStudyPlan(studyplan);
        }
        await API.updateCourses(user.id, courses);
        // Set the just saved study plan in the use state variable 'studyPlan'
        setStudyPlan(studyplan);
      }
      else
        setMessage({msg: 'You can not save the study plan. Not enough credits.', type: 'danger'});
    } else {
      if(credits >= 20 && credits <= 40){
        // Remove from the table courses the previously enrolled student
        if(studyPlan.courses !== null)
          await API.deleteSPcourses(user.id, studyPlan.courses);
        // If there is no study plan in the DB I create a new one, otherwisw I update the existing one
        if(user.studyplan === 1)
          await API.updateStudyPlan(user.id, studyplan);
        else {
          await API.updateUserSP(user.id, 1);
          await API.addStudyPlan(studyplan);
        }
        await API.updateCourses(user.id, courses);
        // Set the just saved study plan in the use state variable 'studyPlan'
        setStudyPlan(studyplan);
      }
      else
        setMessage({msg: 'You can not save the study plan. Not enough credits.', type: 'danger'});
    }
    getCourses();
  }


  const deleteStudyPlan = async () => {
    // Delete from the courses table in the DB the enrolled students in the courses of the studyplan
    if(studyPlan.courses !== null)
      await API.deleteSPcourses(user.id, studyPlan.courses);

    // Set the variable use state 'userHaveSP' to false (the user don't have a study plan)
    await API.updateUserSP(user.id, 0);
    const userSP = await API.getUserById(user.id);
    setUser(userSP);
    setUserHaveSP(false);

    // Set the SP courses to a empty list
    setSPcourses([]);
    // Set the variable use state 'studyPlan' to undefined 
    setStudyPlan(undefined);

    // Delete from the DB the studyplan
    if(user.studyplan === 1)
      await API.deleteStudyPlan(user.id);
  }

  return (
    <Container>
      {message && <Row>
        <Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert>
      </Row> }
    <BrowserRouter>
      <Routes>
        
        <Route path='/login' element={
            (loggedIn) ? <Navigate replace to='/' /> : <LoginRoute login={handleLogin} />
          } />
        
        <Route path='/' element={ (loggedIn && userHaveSP) ?
          <Navigate replace to='/studyplan' /> :
          <CourseRoute courses={courses} SPcourses={SPcourses} showDetails={showDetails} setShowDetails={setShowDetails} user={user}
            loggedIn={loggedIn} logout={handleLogout} setShowForm={setShowForm} showForm={showForm} addStudyPlan={addStudyPlan}/> }/>
        
        <Route path='/studyplan' element={ loggedIn ?
          <StudyPlanRoute SPcourses={SPcourses} courses={courses} showDetails={showDetails} setShowDetails={setShowDetails} loggedIn={loggedIn}
          logout={handleLogout} addCourseToSP={addCourseToSP} deleteCourseToSP={deleteCourseToSP} userHaveSP={userHaveSP} studyPlan={studyPlan} 
          user={user} cancelStudyPlan={cancelStudyPlan} saveStudyPlan={saveStudyPlan} deleteStudyPlan={deleteStudyPlan} 
          setShowForm={setShowForm} showForm={showForm} addStudyPlan={addStudyPlan}/> 
          : <Navigate replace to='/' /> } />
                
        <Route path='*' element={ <DefaultRoute/> } />
      
      </Routes>
    </BrowserRouter>
    </Container>
  );
}

export default App;