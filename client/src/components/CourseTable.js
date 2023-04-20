import { Row, Container, Button } from 'react-bootstrap';
import StudyPlanForm from './StudyPlanForm';
import 'bootstrap-icons/font/bootstrap-icons.css';

function CourseTable(props) {

    let courses = props.courses.sort((a,b) => a.name.localeCompare(b.name));

    return(
        <>
        <Container fluid>
          <Row>
            {props.loggedIn && !props.userHaveSP && !props.showForm &&
            <div className='col'>
              &nbsp; 
              <h2 style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}> You don't have a Study Plan</h2>
              <h3 style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}> Create a new Study Plan here: &nbsp; 
              <Button variant='primary' onClick={() => {props.setShowForm(true)} }>Create</Button>
              </h3>
            </div>
            }
            {props.showForm && props.loggedIn && !props.userHaveSP &&
              <StudyPlanForm showForm={props.showForm} setShowForm={props.setShowForm} user={props.user} addStudyPlan={props.addStudyPlan}/>
            }
          </Row>
          &nbsp; 
          &nbsp; 
          &nbsp; 
          <Row>
            <main>
              <h1>All University Courses</h1>
              {props.loggedIn && props.userHaveSP && 
              <>
                <h3>You can add these courses to your StudyPlan</h3>
                <label>Courses marked in red cannot be added to your Study Plan. </label>
              </>}
                <div className="table-wrapper-scroll-y my-custom-scrollbar">
                  <table className="table mb-0">
                      <thead>
                      <tr>
                          <th></th>
                          <th>Code</th>
                          <th>Name</th>
                          <th>Credits</th>
                          <th>Enrolled Students</th>
                          <th>Max Students</th>
                          {props.loggedIn && props.userHaveSP && <th></th>}
                      </tr>
                      </thead>
                      <tbody>
                      {
                        courses.map((course) => <CourseRow course={course} key={course.code} showDetails={props.showDetails} 
                          setShowDetails={props.setShowDetails} addCourseToSP={props.addCourseToSP} user={props.user}
                          loggedIn={props.loggedIn} SPcourses={props.SPcourses} userHaveSP={props.userHaveSP}/>)
                      }
                      </tbody>
                  </table>
                </div>
            </main>
        </Row>
        </Container>
        </>
    );
}

const checkConstarainsAdd = (course, SPcourses) => {
  
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

  if(incList.length !== 0){
    return false;
  }

  // Check preparatory course
  if(course.prepCourse !== null) {
    if(SPcourses.filter(e => e.code === course.prepCourse).length === 0) {
      return false;
    }
  }
  return true;
  
}

function CourseRow(props) {
  return(
    <>
      <tr bgcolor = {(props.loggedIn && props.userHaveSP && checkConstarainsAdd(props.course, props.SPcourses) === false) ? "FF6B6B" : "F9E1E9"} >
        {(props.course.incompWith || props.course.prepCourse) ?  
            <ExpandActions course={props.course} showDetails={props.showDetails} setShowDetails={props.setShowDetails}/>
            : <td></td> }
            <CourseData course={props.course}/>
            {props.loggedIn && props.userHaveSP &&
            <CourseActions course={props.course} user={props.user} addCourseToSP={props.addCourseToSP}/> }
        </tr>
        {props.showDetails.includes(props.course.code) && (
              <ExpandedData course={props.course}/>
        )}
    </>
  );
}

function CourseData(props) {
  return(
    <>
      <td>{props.course.code}</td>
      <td>{props.course.name}</td>
      <td>{props.course.credits}</td>
      <td>{props.course.enrStud}</td>
      <td>{props.course.maxStudents}</td>
    </>
  );
}

function ExpandedData(props) {
    return(
      <>
        {props.course.incompWith ? (<tr><td></td><td></td><td>Incompatible with: {props.course.incompWith}</td><td></td><td></td><td></td><td></td></tr>) : null}
        {props.course.prepCourse ? (<tr><td></td><td></td><td>Preparation Course: {props.course.prepCourse}</td><td></td><td></td><td></td><td></td></tr>) : null}
      </>
    );
  }


function CourseActions(props) {
  return (
    <td>
      <Button variant='primary' onClick={() => {props.addCourseToSP(props.user.id, props.course)}}> + </Button>
    </td>
  );
}

function ExpandActions(props) {
    return (
      <td>
        <Button variant='light' onClick={() => {expand(props.course.code, props.showDetails, props.setShowDetails)}}><i className='bi bi-arrow-down-short'></i></Button>
      </td>
    );
}

const expand = (code, showDetails, setShowDetails) => {
    const showState = showDetails.slice();
    const index = showState.indexOf(code);

    if(index >= 0) {
        showState.splice(index, 1);
        setShowDetails(showState);
    } else {
        showState.push(code)
        setShowDetails(showState);
    }
}

export default CourseTable;
