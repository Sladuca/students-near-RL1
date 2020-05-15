import React from 'react';
import Presenter from './presenter';

class Geocache extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
      cacheSearch: '',
      cache: {},
    }
  }

  updateText(e) {
    this.setState({
      ...this.state,
      cacheSearch: e.target.value
    });
  }

  async getCache() {
    //get geocache data: log, owner, name
    const cache = await this.props.contract.get_cache({ cache_id: this.state.cacheSearch });
    if (!cache) {
      return 
    }
    this.setState({
      ...this.state,
      cache
    })
    console.log(this.cache_id.log); // not sure about this line. want to get the log from the cache
    console.log(this.state.cache.owner);
    console.log(this.state.cache.name);
  }

  render() {
    return <Presenter updateText={(e) => this.updateText(e)} getCache={() => getCache} />
  }
}

export default Geocache;