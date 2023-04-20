import { Table, Row, Container, Button } from 'react-bootstrap';
import { SaveSPButton, CancelSPButton } from './AuthComponents';
import 'bootstrap-icons/font/bootstrap-icons.css';

function StudyPlanTable(props) {

    let courses = props.courses.sort((a,b) => a.name.localeCompare(b.name));
    return(
        <>
        <Container fluid>
        <Row>
            <main>
              <ul className="list-group list-group-flush" id="list-courses">
                <div className="row">
                    <div className="col-lg-10 mx-auto"></div>
                        <Table responsive="m">
                            <thead>
                            <tr>
                                <th></th>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Credits</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                courses.map((course) => <CourseRow course={course} key={course.code + 'SP'} showDetails={props.showDetails} 
                                  setShowDetails={props.setShowDetails} deleteCourseToSP={props.deleteCourseToSP} user={props.user}/>)
                            }
                            </tbody>
                        </Table>
                    </div>
                </ul>
            </main>
        </Row>
        </Container>
        </>
    );
}

function CourseRow(props) {
  return(
    <>
        <tr bgcolor="E1F9F9">
          {(props.course.incompWith || props.course.prepCourse) ?  
            <ExpandActions course={props.course} showDetails={props.showDetails} setShowDetails={props.setShowDetails}/>
            : <td></td> }
            <CourseData course={props.course}/>
            <CourseActions course={props.course} user={props.user} showDetails={props.showDetails} setShowDetails={props.setShowDetails} deleteCourseToSP={props.deleteCourseToSP}/>
        </tr>
        {props.showDetails.includes(props.course.code + "SP") && (
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
    </>
  );
}

function ExpandedData(props) {
    return(
      <>
        {props.course.incompWith ? (<tr><td></td><td></td><td>Incompatible with: {props.course.incompWith}</td><td></td><td></td></tr>) : null}
        {props.course.prepCourse ? (<tr><td></td><td></td><td>Preparation Course: {props.course.prepCourse}</td><td></td><td></td></tr>) : null}
      </>
    );
  }

function ExpandActions(props) {
    return (
      <td>
        <Button variant='light' onClick={() => {expand(props.course.code, props.showDetails, props.setShowDetails)}}><i className='bi bi-arrow-down-short'></i></Button>
      </td>
    );
}

function CourseActions(props) {
  return (
    <td>
      <Button variant='danger' onClick={() => {props.deleteCourseToSP(props.user.id, props.course)}}> x </Button>
    </td>
  );
}


const expand = (code, showDetails, setShowDetails) => {
    const showState = showDetails.slice();
    const index = showState.indexOf(code + "SP");

    if(index >= 0) {
        showState.splice(index, 1);
        setShowDetails(showState);
    } else {
        showState.push(code + "SP")
        setShowDetails(showState);
    }
}

export default StudyPlanTable;