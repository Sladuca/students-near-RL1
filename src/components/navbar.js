import React from 'react';
import { Navbar, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default () => (
  <Navbar>
    <Navbar.Brand href="/">Geodes</Navbar.Brand>
    <Navbar.Toggle />
    <Navbar.Collapse className="justify-content-end">
      <Row>
        <Col><Navbar.Text><Link to="/geocache">Geocache</Link></Navbar.Text></Col>
        <Col><Navbar.Text><Link to="/satchel">Satchel</Link></Navbar.Text></Col>
      </Row>
    </Navbar.Collapse>
  </Navbar>
);