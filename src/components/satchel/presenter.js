import React from 'react';
import { Form, Row, Col, Button, Table } from 'react-bootstrap';

export default ({ satchel, getGeodes, updateText, mintNew }) => {
  return (
    <>
      <Row>
        <Col>
          <Form noValidate onSubmit={mintNew}>
            <Row>
              <Col>
                <Form.Control onChange={updateText} type="text" placeholder="bio" />
              </Col>
              <Col>
                <Button variant="primary" type="submit">Mint</Button>
              </Col>
            </Row>
          </Form>
        </Col>
        <Col>
          <Button onMouseUp={getGeodes}>
            Get Geodes!
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Owner</th>
                <th>Creator</th>
                <th>Bio</th>
              </tr>
            </thead>
            <tbody>
            { satchel.map((geode, i) => (
              <tr key={i}>
                <td>{ geode.holder }</td>
                <td>{ geode.creator }</td>
                <td>{ geode.bio }</td>
              </tr>
            ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  )
}

