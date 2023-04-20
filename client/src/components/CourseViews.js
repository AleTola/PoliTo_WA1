import { Container, Row, Col } from 'react-bootstrap';
import { MyNavbar } from './NavBar';
import { LoginForm, DeleteSPButton, SaveSPButton, CancelSPButton } from './AuthComponents';

import CourseTable from './CourseTable';
import StudyPlanTable from './StudyPlanTable';

function DefaultRoute() {
  return(
    <Container fluid className='App'>
      <h1>No data here...</h1>
      <h2>This is not the route you are looking for!</h2>
    </Container>
  );
}

function CourseRoute(props) {
  return(
    <Container fluid >
      <Row>
        <MyNavbar loggedIn={props.loggedIn} logout={props.logout} user={props.user}/>
      </Row>
      <Row>
        <Col>
          <CourseTable SPcourses={props.SPcourses} courses={props.courses} showDetails={props.showDetails} 
            setShowDetails={props.setShowDetails} loggedIn={props.loggedIn} logout={props.logout} addStudyPlan={props.addStudyPlan}
            setShowForm={props.setShowForm} showForm={props.showForm} user={props.user} userHaveSP={props.userHaveSP}/>
        </Col>
      </Row>
    </Container>
  );
}


function StudyPlanRoute(props) {
  let totCredits = 0;
  let courses = []
  if(props.SPcourses !== null && props.SPcourses !== []) {
    courses = Array.from(props.SPcourses);
    if (courses[0] !== null) {
      for(let i=0; i< courses.length; i++) {
        totCredits += courses[i].credits;
      }
    }
  }

  return(
    <Container fluid >
      <Row>
        <MyNavbar loggedIn={props.loggedIn} logout={props.logout} user={props.user}/>
      </Row>

      {(props.userHaveSP) ?
      <>
      <h1 style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>Your {props.studyPlan.full_time ? "Full-Time" : "Part-Time"} Study Plan</h1>
      <label style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>   (Min {props.studyPlan.minCredits} credits - Max {props.studyPlan.maxCredits} credits) </label>
      {(totCredits !== 0) ? 
      <>
      <h2>  The total number of credits of the courses inserted is {totCredits} credits.</h2>
      <Row>
        <Col>
          <StudyPlanTable courses={props.SPcourses} showDetails={props.showDetails} setShowDetails={props.setShowDetails} user={props.user}
            loggedIn={props.loggedIn} deleteCourseToSP={props.deleteCourseToSP} cancelStudyPlan={props.cancelStudyPlan}
            saveStudyPlan={props.saveStudyPlan} deleteStudyPlan={props.deleteStudyPlan}/>
        </Col>
      </Row> 
      </>
      :  <h2 style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}> Your Study Plan has no courses.</h2>}

      <Row>
         <div> &nbsp; &nbsp; &nbsp;
          <SaveSPButton saveStudyPlan={props.saveStudyPlan}/> &nbsp; &nbsp; &nbsp;
          <CancelSPButton cancelStudyPlan={props.cancelStudyPlan}/> 
          <div style={{display: 'flex',  justifyContent:'right', alignItems:'right'}}> <DeleteSPButton deleteStudyPlan={props.deleteStudyPlan} /> </div>
        </div>
      </Row>
      </>  :  null}

      <Row>
        <Col>
          <CourseTable SPcourses={props.SPcourses} courses={props.courses} showDetails={props.showDetails} setShowDetails={props.setShowDetails} 
            loggedIn={props.loggedIn} logout={props.logout} showStudyPlan={props.showStudyPlan} showForm={props.showForm} addStudyPlan={props.addStudyPlan}
            setShowForm={props.setShowForm} addCourseToSP={props.addCourseToSP} userHaveSP={props.userHaveSP} user={props.user}/>
        </Col>
      </Row>
    </Container>
  );
}

function LoginRoute(props) {
  return(
    <>
      <Row>
        <Col>
          <h1>Login</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <LoginForm login={props.login} />
        </Col>
      </Row>
    </>
  );
}

export { CourseRoute, DefaultRoute, LoginRoute, StudyPlanRoute };