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
      mode: '',
      tradeSelect: {
        give: null,
        take: null,
      },
      addResult: false,
      tradeResult: false,
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

  updateGive(give) {
    try {
      give = parseInt(give, 10);
    } catch(err) {
      console.error(err)
      return;
    }
    this.setState({
      ...this.state,
      tradeSelect: {
        give,
        take: this.state.tradeSelect.take
      }
    })
  }

  updateTake(take) {
    try {
      take = parseInt(take, 10);
    } catch(err) {
      console.error(err)
      return;
    }
    this.setState({
      ...this.state,
      tradeSelect: {
        give: this.state.tradeSelect.give,
        take
      }
    })
  }

  updateMode(mode) {
    if (mode !== 'TRADE' && mode !== 'ADD') {
      return;
    }
    this.setState({
      ...this.state,
      mode
    })
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
    const geodeIds = await this.props.contract.get_geode_ids_by_owner({ owner: id }) || [];
    const geodes = await Promise.all(geodeIds.map(id => this.props.contract.get_geode({ geode_id: id})));
    this.setState({
      ...this.state,
      cache: {
        ...cache,
        id,
        geodes: geodes.map((geode, i) => ({ ...geode, id: geodeIds[i] }))
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

  async tradeWithCache () {
    if (!this.state.tradeSelect.give || !this.state.tradeSelect.take) {
      return;
    }
    console.log(`tradeWithCache: geode ${this.state.tradeSelect.give}`)
    const res = await this.props.contract.trade_with_cache({ cache_id: this.state.cache.id, give: this.state.tradeSelect.give, take: this.state.tradeSelect.take });
    if (res) {
      const tradeResult = await this.props.contract.transfer_from({ to: await this.props.wallet.getAccountId(), from: this.state.cache.id, geode_id: this.state.tradeSelect.take });
      this.setState({
        ...this.state,
        tradeResult,
      });
      await this.props.getGeodes();
    }
    console.log(`done: tradeWithCache`)
  }

  async addToCache () {
    if (!this.state.tradeSelect.give) {
      return;
    }
    console.log(`addToCache: geode ${this.state.tradeSelect.give}`)
    const addResult = await this.props.contract.add_geode_to_cache({ cache_id: this.state.cache.id, geode_id: this.state.tradeSelect.give });
    this.setState({
      ...this.state,
      addResult
    });
    await Promise.all([this.getCache(this.state.cache.id), this.props.getGeodes()]);
    console.log(`done: addToCache`)
  }

  async handleSubmitTrade(e) {
    e.preventDefault();
    if (this.state.mode === 'TRADE') {
      await this.tradeWithCache();
    } else if (this.state.mode === 'ADD') {
      await this.addToCache();
    } else {
      console.log(`bruh: ${this.state.mode}`)
    }
  }

  render() {
    return <Presenter submitTrade={async (e) => await this.handleSubmitTrade(e)}updateMode={(e) => this.updateMode(e.target.value)} updateTake={(e) => this.updateTake(e.target.value)} updateGive={(e) => this.updateGive(e.target.value)}  updateMsg={(e) => this.updateMsg(e.target.value)} updateSearch={(e) => this.updateSearch(e.target.value)} getCache={async (e) => { e.preventDefault(); await this.getCache(); }} signCache={async (e) => { e.preventDefault(); await this.signCache() }} cache={this.state.cache} />
  }
}

export default Geocache;