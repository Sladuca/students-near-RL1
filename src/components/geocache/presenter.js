import React from 'react';
import { Row, Col, Form, Button} from 'react-bootstrap';

export default ({ updateText, getCache }) => {
  return (
    <>
      <Row>
        <Col>
          <Form noValidate onSubmit={getCache}>
            <Row>
              <Col>
                <Form.Control onChange={updateText} type="text" placeholder="cache id" />
              </Col>
              <Col>
                <Button variant="primary" type="submit">Get Cache!</Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
      {/* Still have to add trade with / add to cache */}
    </>
  );
}