import 'bootstrap/dist/css/bootstrap.min.css';
import 'regenerator-runtime/runtime';
import React, { Component } from 'react';
import Geocache from './components/geocache';
import Satchel from './components/satchel';
import Navbar from './components/navbar';
import SignIn from './components/signin';
import { Container, Row, Col } from 'react-bootstrap';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

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
    })
  }

  render() {
    // define some kind if sign in screen
    if (!this.state.login) {
      return (
          <SignIn requestSignIn={this.requestSignIn}/>
      );
    }
    return (
      <Router>
        <Container>
          <Row>
            <Col>
              <Navbar/>
            </Col>
          </Row>
          <Switch>
            <Route path="/geocache">
              <Geocache contract={this.props.contract} wallet={this.props.wallet}/>
            </Route>
            <Route path="/satchel">
              <Satchel contract={this.props.contract} wallet={this.props.wallet}/>
            </Route>
            <Route path="/">
              <h1>Home!</h1>
            </Route>
          </Switch>
        </Container>
      </Router>
    );
  }
}

export default App;
