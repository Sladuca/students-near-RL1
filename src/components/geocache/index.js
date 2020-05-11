import React from 'react';
import Presenter from './presenter';

class Geocache extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
      cacheSearch: ''
    }
  }

  updateText(e) {
    this.setState({
      ...this.state,
      cacheSearch: e.target.value
    });
  }

  render() {
    return <Presenter updateText={(e) => this.updateText(e)}/>
  }
}

export default Geocache;