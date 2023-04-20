import { useState } from 'react';
import { Button, Form, Row } from 'react-bootstrap';

function StudyPlanForm(props) {

    const [checkedIds, setCheckedIds] = useState();

    const handleCheck = (id) => {
        setCheckedIds(id);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if(checkedIds === ("option-full-time") || checkedIds === ("option-part-time")) {

            let fullTime = 0;
            let max_credits = 40;
            let min_credits = 20;

            if(checkedIds === ("option-full-time")) {
                fullTime = 1;
                max_credits = 80;
                min_credits = 60;
            }

            const studyplan = {userId: props.user.id, full_time: fullTime, minCredits: min_credits, maxCredits: max_credits, actualCredits: 0, courses: null };

            props.addStudyPlan(studyplan);
            
            props.setShowForm(false);
        }
    }

    return(
        <>
        &nbsp; 
        <h1>Create a new Study Plan</h1>
        <h2> Choose one of these two options:</h2>
        &nbsp; 
        <Form onSubmit={handleSubmit}>
            <h4>
                <input
                    id="option-full-time"
                    className="form-check-input"
                    type="checkbox"
                    checked={checkedIds === ("option-full-time")}
                    onChange={(e) => handleCheck(e.target.id)}
                />{" "}
                Full time
            </h4>
            &nbsp; { /* Adding a blank space between the two buttons */ }
            &nbsp;
            &nbsp;
            <h4>
                <input
                    id="option-part-time"
                    className="form-check-input"
                    type="checkbox"
                    checked={checkedIds === ("option-part-time")}
                    onChange={(e) => handleCheck(e.target.id)}
                />{" "}
                Part time
            </h4>
            &nbsp; { /* Adding a blank space between the two buttons */ }
            &nbsp;
            &nbsp;
            <Row>
                <div>
                <Button variant="success" type="submit">Create</Button> &nbsp; &nbsp;
                <Button variant="danger" onClick={() => {props.setShowForm(false)}}>Cancel</Button>
                </div>
            </Row>
            &nbsp; 
            &nbsp;
            &nbsp;
        </Form>
        </>
    );
}
export default StudyPlanForm;