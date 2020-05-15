import React from 'react';
import { Button } from 'react-bootstrap';

export default ({ requestSignIn }) => {
  return <Button onMouseUp={requestSignIn}>Sign In</Button>;
}