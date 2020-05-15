import React from 'react'
import Presenter from './presenter';

class CreateCache extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
      cacheName: '',
      createResult: '',
    };
  }

  updateText(val) {
    this.setState({
      ...this.state,
      cacheName: val
    })
  }

  async createCache() {
    const cacheId = await this.props.contract.create_cache({ name: this.state.cacheName });
    // returns null on error
    if (!cacheId) {
      return;
    }
    this.setState({
      ...this.state,
      createResult: cacheId
    });
  }

  render() {
    return (
      <Presenter updateText={(e) => { this.updateText(e.target.value) }} createCache={(e) => { e.preventDefault(); this.createCache() }}/>
    )
  }
}

export default CreateCache;