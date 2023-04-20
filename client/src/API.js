
import Course from './Course';
const SERVER_URL = 'http://localhost:3001';

/*** Courses APIs ***/

const getAllCourses = async () => {
  const response = await fetch('http://localhost:3001/api/courses', {
    credentials: 'include',
  });
  const coursesJson = await response.json();
  
  if(response.ok) {
    return coursesJson.map(ex => new Course(ex.code, ex.name, ex.credits, ex.maxStudents, ex.incompWith, ex.prepCourse, ex.enrStud));
  }
  else
    throw coursesJson; // send error message if any
};

const addCourse = async (course) => {
  const response = await fetch(`${SERVER_URL}/api/courses`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({code: course.code, name: course.name, credits: course.credits, maxStudents: course.maxStudents, 
              incompWith: course.incompWith, prepCourse: course.prepCourse, enrStud: course.enrStud})
  });
  
  if(!response.ok){
      const errMessage = await response.json();
      throw errMessage;
  } else return null;
}

const updateCourses = async (userId, courses) => {
  const response = await fetch(`${SERVER_URL}/api/courses`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ userId: userId, courses: courses })
  });

  if(!response.ok){
    const errMessage = await response.json();
    throw errMessage;
  }
  else return null;
}


const deleteSPcourses = async (userId, courses) => {
  const response = await fetch(`${SERVER_URL}/api/courses/delete`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ userId: userId, courses: courses })
  });

  if(!response.ok){
    const errMessage = await response.json();
    throw errMessage;
  }
  else return null;
}

/*** Study Plan APIs ***/

const addStudyPlan = async (studyplan) => {
  const response = await fetch(`${SERVER_URL}/api/studyplan`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(studyplan)
  });
  
  if(!response.ok){
      const errMessage = await response.json();
      throw errMessage;
  } else 
    return null;
}

const deleteStudyPlan = async (userId) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/studyplan/${userId}`, {
      method: 'DELETE'
    });
    if(response.ok)
      return null;
    else {
      const errMessage = await response.json();
      throw errMessage;
    }
  } catch(err){
    throw new Error('Cannot communicate with the server');
  }
}

const getStudyPlan = async (userId) => {
  //const id = parseInt(userId);
  const response = await fetch(`${SERVER_URL}/api/studyplan/${userId}`, {
    credentials: 'include',
  });

  if(response === undefined) {
    return undefined;
  }

  if(response.ok) {
      try {
          const studyplan = response.json();
          return studyplan;
      } catch(err) {
          return undefined;
      }
  } else {
      if(response.status === 404) {
        return response;
      }
      throw response; // send error message if any
  }
};

const getStudyPlanCourses = async (userId) => {
  const response = await fetch(`${SERVER_URL}/api/studyplan/${userId}/courses`, {
    credentials: 'include',
  });

  if(response.ok) {
    const coursesJson = await response.json();
    return coursesJson;
  }
  else {
    throw response; // send error message if any
  }
};

const updateStudyPlan = async (userId, studyplan) => {
  const response = await fetch(`${SERVER_URL}/api/studyplan/${userId}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({userId: studyplan.userId, full_time: studyplan.full_time, minCredits: studyplan.minCredits, maxCredits: studyplan.maxCredits,
      actualCredits: studyplan.actualCredits, courses: studyplan.courses})
  });

  if(!response.ok){
    const errMessage = await response.json();
    throw errMessage;
  }
  else return null;
}

const deleteCourseStudyPlan = async (userId, course) => {
  const response = await fetch(`${SERVER_URL}/api/studyplan/${userId}/delete`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({course: course.code, credits: course.credits})
  });

  if(!response.ok){
    const errMessage = await response.json();
    throw errMessage;
  }
  else return null;
}

/*** User APIs ***/

const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + '/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if(response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    const errDetails = await response.text();
    throw errDetails;
  }
};
  
const getUserInfo = async () => {
  try {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
      credentials: 'include',
    });
    const user = await response.json();
    if (response.ok) {
      return user;
    } else {
      throw user;  // an object with the error coming from the server
    }
  } catch {
    return undefined;
  }
};

const logOut = async() => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return null;
}


const updateUserSP = async (userId, value) => {
  const response = await fetch(`${SERVER_URL}/api/user/${userId}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({value: value})
  });
  if(!response.ok){
    const errMessage = await response.json();
    throw errMessage;
  }
  else return null;
}


const getUserById = async (userId) => {
  const response = await fetch(`${SERVER_URL}/api/user/${userId}`, {
    credentials: 'include',
  });

  if(response.ok) {
    const userJson = await response.json();
    return userJson;
  }
  else {
    throw response; // send error message if any
  }
};

const API = {getAllCourses, addCourse, logIn, logOut, getUserInfo, addStudyPlan, updateStudyPlan, deleteSPcourses, getUserById,
              getStudyPlan, deleteCourseStudyPlan, getStudyPlanCourses, deleteStudyPlan, updateCourses, updateUserSP};
export default API;