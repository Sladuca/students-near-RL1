import React, { useState } from 'react';
import { Row, Col, Form, Button, Table, Modal, ButtonGroup, ToggleButton } from 'react-bootstrap';

export default ({ submitTrade, updateGive, updateTake, updateMode, updateMsg, updateSearch, getCache, signCache, cache }) => {
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleOpen = () => setShowModal(true);

  const cacheDetails = !cache.log ? '' : (
    <>
      <Row>
        <Col>
          <Button onMouseUp={handleOpen}>
            Open Cache!
          </Button>
        </Col>
      </Row>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
        <Modal.Title>{`${cache.name}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-row pt-4">
            <h5>{`(${cache.latitude}, ${cache.longitude})`}</h5>
          </div>
          <div className="flex flex-row py-4">
            <h3>Log</h3>
          </div>
          <div className="flex flex-row py-4">
            <Table>
              <thead>
                <tr>
                  <th>Geocacher</th>
                  <th>Date</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
              { cache.log.map((entry, i) => (
                <tr key={i}>
                  <td>{ entry.geocacher }</td>
                  <td>{ entry.date }</td>
                  <td>{ entry.message }</td>
                </tr>
              ))}
              </tbody>
            </Table>
          </div>
          <div className="flex flex-row pt-4">
            <h3>Contents</h3>
          </div>
          <div className="flex flex-row py-4">
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Bio</th>
                  <th>Creator</th>
                </tr>
              </thead>
              <tbody>
              { cache.geodes.map((geode, i) => (
                <tr key={i}>
                  <td>{ geode.id }</td>
                  <td>{ geode.bio }</td>
                  <td>{ geode.creator }</td>
                </tr>
              ))}
              </tbody>
            </Table>
          </div>
          <div className="flex flex-row py-4">
            <ButtonGroup toggle onChange={updateMode}>
              <ToggleButton type="radio" name="radio" defaultChecked value="TRADE">
                Trade
              </ToggleButton>
              <ToggleButton type="radio" name="radio" value="ADD">
                Add
              </ToggleButton>
            </ButtonGroup>
          </div>
          <div className="flex flex-row py-4">
            <Form noValidate onSubmit={submitTrade}>
              <Row>
                <Col>
                  <Form.Control onChange={updateGive} type="text" placeholder="give"/>
                </Col>
                <Col>
                  <Form.Control onChange={updateTake} type="text" placeholder="take" />
                </Col>
                <Col>
                  <Button variant="primary" type="submit">Submit</Button>
                </Col>
              </Row>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Form noValidate onSubmit={signCache}>
            <Row>
              <Col>
                <Form.Control onChange={updateMsg} type="text" placeholder="msg" />
              </Col>
              <Col>
                <Button variant="primary" type="submit">Sign</Button>
              </Col>
            </Row>
          </Form>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
  return (
    <>
      <Row>
        <Col>
          <Form noValidate onSubmit={getCache}>
            <Row>
              <Col>
                <Form.Control onChange={updateSearch} type="text" placeholder="cache id" />
              </Col>
              <Col>
                <Button variant="primary" type="submit">Get Cache!</Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
      { cacheDetails }
      {/* Still have to add trade with / add to cache */}
    </>
  );
}