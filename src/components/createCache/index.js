import React from 'react'
import Presenter from './presenter';

class CreateCache extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
      cacheName: '',
      createResults : [],
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
    const newCacheResults = cacheId ? [...this.state.createResults, cacheId] : [...this.state.createResults, false]
    this.setState({
      ...this.state,
      createResults: newCacheResults
    });
  }

  render() {
    return (
      <Presenter createResults={this.state.createResults} updateText={(e) => { this.updateText(e.target.value) }} createCache={(e) => { e.preventDefault(); this.createCache() }}/>
    )
  }
}

export default CreateCache;