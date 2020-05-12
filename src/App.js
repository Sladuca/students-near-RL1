import 'regenerator-runtime/runtime';
import React, { Component } from 'react';
import Geocache from './components/geocache';
import Satchel from './components/satchel';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
      page: 'geocache'
    }
    this.funcs = {
      signedInFlow: this.signedInFlow.bind(this),
      requestSignIn: this.requestSignIn.bind(this),
      requestSignOut: this.requestSignOut.bind(this),
      signedOutFlow: this.signedOutFlow.bind(this)
    }
  }

  componentDidMount() {
    let loggedIn = this.props.wallet.isSignedIn();
    if (loggedIn) {
      this.signedInFlow();
    } else {
      this.signedOutFlow();
    }
  }

  async signedInFlow() {
    console.log("come in sign in flow")
    this.setState({
      login: true,
      page: 'geocache'
    })
    const accountId = await this.props.wallet.getAccountId()
    console.log(accountId)
    if (window.location.search.includes("account_id")) {
      window.location.replace(window.location.origin + window.location.pathname)
    }
  }

  async requestSignIn() {
    const appTitle = 'Geodes';
    await this.props.wallet.requestSignIn(
      window.nearConfig.contractName,
      appTitle
    )
  }

  requestSignOut() {
    this.props.wallet.signOut();
    setTimeout(this.signedOutFlow, 500);
    console.log("after sign out", this.props.wallet.isSignedIn())
  }

  signedOutFlow() {
    if (window.location.search.includes("account_id")) {
      window.location.replace(window.location.origin + window.location.pathname)
    }
    this.setState({
      login: false,
      page: 'geocache'
    })
  }

  goToPage(page) {
    this.setState({
      ...this.state,
      page
    })
  }

  render() {
    // define some kind if sign in screen
    if (!this.state.login) {
      return <button onMouseUp={(e) => this.requestSignIn(e)}/>
    }
    switch (this.state.page) {
      case 'geocache':
        return (
          <>
            <Geocache funcs={ this.funcs } contract={this.props.contract} wallet={this.props.wallet}/>
            <label htmlFor="satchel">open satchel</label>
            <button id="satchel" onMouseUp={(e) => this.goToPage('satchel')}></button>
          </>
        )
      case 'satchel':
        return (
          <>
            <Satchel contract={this.props.contract} wallet={this.props.wallet}/>
            <label htmlFor="geocache">open geocache</label>
            <button id="geocache" onMouseUp={(e) => this.goToPage('geocache')}></button>
          </>
        )
      default:
        return (
          <h1>Page does not exist!</h1>
        )
    }
  }
}

export default App;
