import React from 'react';
import Presenter from './presenter';

class Satchel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      satchel: [],
      bioInput: ''
    }
  }

  updateText(e) {
    this.setState({
      ...this.state,
      bioInput: e.target.value
    });
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
    });
  }

  async mintNew() {
    const bio = this.state.bioInput;
    if (bio.length > 280) {
      console.log('must be <= 280 characters!');
      return;
    }
    const geode_id = await this.props.contract.mint_new({ bio });
    if (!geode_id) {
      console.log('mint failed!')
      return;
    }
    const geode = await this.props.contract.get_geode({ geode_id });
    if (!geode) {
      console.log('geode doesnt exist???')
      return;
    }
    this.setState({
      ...this.state,
      satchel: [...this.state.satchel, geode]
    });
  }

  render() {
    return <Presenter satchel={this.state.satchel} getGeodes={async (e) => this.getGeodes()} mintNew={async (e) => {
      if (e.key === 'Enter') {
        await this.mintNew()
      }
    }} updateText={(e) => this.updateText(e)}/>
  }
}

export default Satchel;