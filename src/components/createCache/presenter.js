import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';

export default ({ updateText, createCache }) => (
  <>
    <Row>
      <Col>
        <Form noValidate onSubmit={createCache}>
          <Row>
            <Col>
              <Form.Control onChange={updateText} type="text" placeholder="cache name" />
            </Col>
            <Col>
              <Button variant="primary" type="submit">Create Cache!</Button>
            </Col>
          </Row>
        </Form>
      </Col>
    </Row>
    {/* Still have to add trade with / add to cache */}
  </>
);