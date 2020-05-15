import React from 'react';
import Presenter from './presenter';

class Geocache extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
      cacheSearch: '',
      cache: {},
      signMessage: '',
      cacheSigned: false,
    }
  }

  updateSearch(val) {
    this.setState({
      ...this.state,
      cacheSearch: val
    });
  }

  updateMsg(val) {
    this.setState({
      ...this.state,
      signMessage: val
    });
  }


  async getCache(id) {
    //get geocache data: log, owner, name
    if (!id) {
      id = this.state.cacheSearch;
    }
    const cache = await this.props.contract.get_cache({ cache_id: id });
    if (!cache) {
      return 
    }
    this.setState({
      ...this.state,
      cache: {
        ...cache,
        id
      }
    })
    console.log(this.state.cache.log); // not sure about this line. want to get the log from the cache
    console.log(this.state.cache.owner);
    console.log(this.state.cache.name);
  }

  async signCache() {
    const res = await this.props.contract.sign_cache({ cache_id: this.state.cache.id, message: this.state.signMessage });
    if (!res) {
      return;
    }
    this.setState({
      ...this.state,
      cacheSigned: true
    });
    // update log
    await this.getCache(this.state.cache.id)
  }

  render() {
    return <Presenter updateMsg={(e) => this.updateMsg(e.target.value)} updateSearch={(e) => this.updateSearch(e.target.value)} getCache={async (e) => { e.preventDefault(); await this.getCache(); }} signCache={async (e) => { e.preventDefault(); await this.signCache() }} cache={this.state.cache} />
  }
}

export default Geocache;