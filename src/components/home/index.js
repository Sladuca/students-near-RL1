import React from 'react';
import Presenter from './presenter';

export default ({ requestSignIn, isSignedIn }) => {
  return (
    <Presenter isSignedIn={isSignedIn} requestSignIn={requestSignIn}/>
  );
}