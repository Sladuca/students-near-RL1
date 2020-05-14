import React from 'react';
import Presenter from './presenter';

class Geocache extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
      cacheSearch: '',
      cache: cache,
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
    const cache_id = await this.props.contract.get_cache({cache_id: id_from_text });
    e
    this.state.cache.log = {};
    this.state.cache.owner = '';
    this.state.cache.name = '';
    console.log(this.cache_id.log); // not sure about this line. want to get the log from the cache
    console.log(this.state.cache.owner);
    console.log(this.state.cache.name);
  }

  render() {
    return <Presenter updateText={(e) => this.updateText(e)}/>
  }
}

export default Geocache;