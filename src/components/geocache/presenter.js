import React, { useState } from 'react';
import { Row, Col, Form, Button, Table, Modal } from 'react-bootstrap';

export default ({ updateMsg, updateSearch, getCache, signCache, cache }) => {
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleOpen = () => setShowModal(true);

  const cacheDetails = !cache.log ? '' : (
    <>
      <Row>`x`
        <Col>
          <Button onMouseUp={handleOpen}>
            Open Cache!
          </Button>
        </Col>
      </Row>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
        <Modal.Title>{`Contents of ${cache.name}, owned by ${cache.owner}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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