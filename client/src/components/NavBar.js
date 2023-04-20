
   
import { Navbar, Row, Col, Container, Nav, Button } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';

 function UniLogo() {
    return(
        <span className="navbar-brand mb-0 h1">
            <i className="bi bi-journals"></i> University Courses
        </span>
    );
}

function LogButtons(props) {
    return(
        <div className='row'>
            {props.loggedIn &&  <div className='col'>
                <Row>
                    <Col><span className="navbar-brand mb-0 h1">
                          Username: {props.user.name} 
                          </span>
                        <Button variant="light" onClick={props.logout}>Logout</Button>
                    </Col>
                </Row>
            </div>}
            {!props.loggedIn && <div className='col'>
              <Link to='/login'>
                <Button variant="btn btn-light">Login</Button>
              </Link>
              </div>}
        </div>
    );
}

function MyNavbar(props) {
    return(
        <Navbar collapseOnSelect expand="lg" bg="primary" variant="dark" >        
             <Container fluid>
                <Navbar.Brand><UniLogo/></Navbar.Brand>
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="ms-auto">
                        <LogButtons logout={props.logout} loggedIn={props.loggedIn} user={props.user}/>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export{ MyNavbar };