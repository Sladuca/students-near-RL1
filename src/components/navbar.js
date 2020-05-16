import React from 'react';
import { Navbar, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default () => (
  <Navbar>
    <Navbar.Brand href="/" className="text-gray-300">Geodes</Navbar.Brand>
    <Navbar.Toggle />
    <Navbar.Collapse className="justify-content-end">
      <Row>
        <Col><Navbar.Text><Link to="/geocache" style={{ textDecoration: 'none' }}><div className="text-gray-gray-500 hover:text-gray-100 hover:text-opacity-75 transition duration-200 ease-in-out">Geocache</div></Link></Navbar.Text></Col>
        <Col><Navbar.Text><Link to="/satchel" style={{ textDecoration: 'none' }}><div className="text-gray-gray-500 hover:text-gray-100 hover:text-opacity-75 transition duration-200 ease-in-out">Satchel</div></Link></Navbar.Text></Col>
        <Col><Navbar.Text><Link to="/create_geocache" style={{ textDecoration: 'none' }}><div className="text-gray-gray-500 hover:text-gray-100 hover:text-opacity-75 transition duration-200 ease-in-out">Create</div></Link></Navbar.Text></Col>
      </Row>
    </Navbar.Collapse>
  </Navbar>
);