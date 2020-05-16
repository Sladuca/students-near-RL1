import React from 'react';
import ReactDOM from 'react-dom';
import './assets/main.css'

import App from './App';
import getConfig from './config.js';
import * as nearlib from 'near-api-js';

// Initializing contract
async function initContract() {
    window.nearConfig = getConfig(process.env.NODE_ENV || 'development')
    console.log("nearConfig", window.nearConfig);

    // Initializing connection to the NEAR DevNet.
    window.near = await nearlib.connect(Object.assign({ deps: { keyStore: new nearlib.keyStores.BrowserLocalStorageKeyStore() } }, window.nearConfig));
    
    // Needed to access wallet login
    window.walletAccount = new nearlib.WalletAccount(window.near);
    
    // Getting the Account ID. If unauthorized yet, it's just empty string.
    window.accountId = window.walletAccount.getAccountId();

    // Initializing our contract APIs by contract name and configuration.
    let acct = await new nearlib.Account(window.near.connection, window.accountId);
    window.contract = await new nearlib.Contract(acct, window.nearConfig.contractName, {
        // View methods are read only. They don't modify the state, but usually return some valuemk.
        viewMethods: ['get_cache', 'get_geode', 'get_geode_ids_by_owner'],
        // Change methods can modify the state. But you don't receive the returned value when called.
        changeMethods: ['create_cache', 'sign_cache', 'add_geode_to_cache', 'trade_with_cache', 'mint_new', 'mint_copy', 'approve', 'transfer_from', 'transfer'],
        // Sender is the account ID to initialize transactions.
        sender: window.accountId
    });
}

window.nearInitPromise = initContract().then(() => {
  ReactDOM.render(<App className="bg-white" contract={window.contract} wallet={window.walletAccount} />,
    document.getElementById('root')
  );
}).catch(console.error)