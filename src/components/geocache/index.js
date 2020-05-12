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

  async getCache() {
    //get geocache data: log, owner, name
    const cache_id = await this.props.contract.get_cache({cache_id: id_from_text });
    console.log(this.cache_id.log); // not sure about this line. want to get the log from the cache
    console.log(cache_id);
  }

  render() {
    return <Presenter updateText={(e) => this.updateText(e)}/>
  }
}

export default Geocache;