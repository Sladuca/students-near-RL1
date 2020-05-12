import React from 'react';
import Presenter from './presenter';

class Satchel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
      satchel: [],
    }
  }

  async getGeodes() {
    // get geode id's
    const accountId = await this.props.wallet.getAccountId();
    const ids = await this.props.contract.get_geode_ids_by_owner({ owner: accountId }) || [];
    console.log(ids)
    // fetch geode structs concurrently
    const geodePromises = ids.map(id => this.props.contract.get_geode({ geode_id: id }));
    const geodes = await Promise.all(geodePromises);
    this.setState({
      ...this.state,
      satchel: geodes
    })
  }

  render() {
    return <Presenter satchel={this.state.satchel} getGeodes={async (e) => this.getGeodes()}/>
  }
}

export default Satchel;