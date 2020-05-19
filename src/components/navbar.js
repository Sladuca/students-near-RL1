import img from '../assets/geode_other_logo.png';

console.log(img)

import React from 'react';
import { Navbar, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default () => (
  <Navbar>
    <Navbar.Brand href="/" className="text-gray-300"><img className="h-10" src={`${window.origin}${img}`}/></Navbar.Brand>
    <Navbar.Toggle />
    <Navbar.Collapse className="justify-content-end">
      <div className="flex flex-row justify-end">
        <div className="flex flex-col px-2">
          <Navbar.Text><Link to="/geocache" style={{ textDecoration: 'none' }}><div className="text-gray-100 hover:text-gray-300 transition duration-200 ease-in-out">Geocache</div></Link></Navbar.Text>
        </div>
        <div className="flex flex-col px-2">
          <Navbar.Text><Link to="/satchel" style={{ textDecoration: 'none' }}><div className="text-gray-100 hover:text-gray-300 transition duration-200 ease-in-out">Satchel</div></Link></Navbar.Text>
        </div>
        <div className="flex flex-col px-2">
          <Navbar.Text><Link to="/create_geocache" style={{ textDecoration: 'none' }}><div className="text-gray-100 hover:text-gray-300 transition duration-200 ease-in-out">Create Geocache</div></Link></Navbar.Text>
        </div>
      </div>
    </Navbar.Collapse>
  </Navbar>
);