import React from 'react';
import Presenter from './presenter';

class Satchel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      satchel: [],
      bioInput: ''
    }
    this.mintNew = this.mintNew.bind(this);
    this.getGeodes = this.getGeodes.bind(this);
    this.updateText = this.updateText.bind(this);
  }

  updateText(e) {
    this.setState({
      ...this.state,
      bioInput: e.target.value
    });
  }

  async getGeodes(e) {
    e.preventDefault();
    // get geode id's
    const ids = await this.props.contract.get_geode_ids_by_owner({ owner: window.accountId }) || [];
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
    await this.props.contract.mint_new({ bio: bio });
    await this.getGeodes();
  }

  render() {
    return <Presenter satchel={this.state.satchel} getGeodes={this.getGeodes} mintNew={this.mintNew} updateText={this.updateText}/>
  }
}

export default Satchel;