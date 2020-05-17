import React from 'react';
import Presenter from './presenter';

class Satchel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bioInput: ''
    }
    this.mintNew = this.mintNew.bind(this);
    this.updateText = this.updateText.bind(this);
  }

  updateText(e) {
    this.setState({
      ...this.state,
      bioInput: e.target.value
    });
  }

  async mintNew() {
    const bio = this.state.bioInput;
    if (bio.length > 280) {
      console.log('must be <= 280 characters!');
      return;
    }
    await this.props.contract.mint_new({ bio: bio });
    await this.props.getGeodes();
  }

  render() {
    return <Presenter satchel={this.props.satchel} getGeodes={(e) => { e.preventDefault(); this.props.getGeodes() }} mintNew={async (e) => { e.preventDefault(); await this.mintNew() }} updateText={this.updateText}/>
  }
}

export default Satchel;