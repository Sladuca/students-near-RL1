import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';

export default ({ isSignedIn, requestSignIn,  }) => {
  return !isSignedIn ? (
    <Row>
      <Col className="object-center-top">
        <div className="flex flex-col justify-around">
          <div className="flex flex-row justify-center mb-8">
            <h1 className="text-4xl z-10 font-semibold text-gray-800">Geocaching Made <i className=" font-extrabold text-green-700">Social</i></h1>
          </div>
          <div className="flex flex-row justify-center my-10">
            <h1>[graphic]</h1>
          </div>
        </div>
      </Col>
    </Row>
  ) : <Redirect to="/satchel"/>
}