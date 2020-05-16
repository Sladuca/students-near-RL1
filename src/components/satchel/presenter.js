import React from 'react';
import { Form, Row, Col, Button, Table } from 'react-bootstrap';

export default ({ satchel, getGeodes, updateText, mintNew }) => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row py-4 justify-end">
        <Form noValidate onSubmit={mintNew}>
          <div className="flex flex-row">
            <Form.Control onChange={updateText} type="text" placeholder="bio" />
            <Button className="ml-4" variant="primary" type="submit">Mint</Button>
          </div>
        </Form>
      </div>
      <div className="flex flex-row pt-4 pb-2">
          <Button onMouseUp={getGeodes} block>
            Update Satchel
          </Button>
      </div>
      <div className="flex flex-row pb-4">
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
      </div>
    </div>
  )
}

