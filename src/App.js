import 'regenerator-runtime/runtime';
import React, { Component } from 'react';
import Geocache from './components/geocache'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
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
    })
    const accountId = await this.props.wallet.getAccountId()
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
      speech: null
    })
  }

  render() {
    // define some kind if sign in screen
    if (!this.state.login) {
      return <button onMxouseUp={this.requestSignIn}/>
    }
    return (
      <Geocache funcs={ this.funcs }/>
    )
  }

}

export default App;
