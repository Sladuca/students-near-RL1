import React from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';

export default ({ updateText, createCache, createResults }) => (
  <>
    <Row>
      <Col>
        <Form noValidate onSubmit={createCache}>
          <Row>
            <Col>
              <Form.Control onChange={updateText} type="text" placeholder="cache name" />
            </Col>
            <Col>
              <Button variant="primary" type="submit">Register!</Button>
            </Col>
          </Row>
        </Form>
      </Col>
    </Row>
    <div className="flex flex-col">
      {createResults.map((res, i) => (
        <div className="flex flex-row py-4">
          <Alert key={i} variant={res ? 'success' : 'danger'}>
            {res ? `successfully registered geocache with id ${res} 🎉` : `failed to register geocache 😭`}
          </Alert>
        </div>
      ))}
    </div>
  </>
);