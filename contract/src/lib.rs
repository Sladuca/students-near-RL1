use near_sdk::{near_bindgen, env};
use borsh::{BorshDeserialize, BorshSerialize};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::prelude::*;

// -------- GEOCACHE -------- //

#[derive(PartialEq, PartialOrd, Eq, Hash, Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
pub struct LogEntry {
    geocacher: String, // geocacher's account id
    date: String, // date signed
    message: String, // a friendly message :)
}

#[near_bindgen]
#[derive(Default, BorshDeserialize, BorshSerialize)]
pub struct Geocache {
    log: Vec<LogEntry>,
    owner: String,
    account_id: String,
}

#[near_bindgen]
impl Geocache {
    pub fn sign_in(&mut self, message: String) {
        let account_id = env::signer_account_id();
        self.log.push(LogEntry { 
            geocacher: account_id,
            date: Utc::now().to_string(),
            message: message,
        });
    }

    // trade
}

// -------- GEOCOIN  -------- //

#[derive(PartialEq, PartialOrd, Eq, Hash, Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
pub struct GeoCoin {
    holder: String,
    bio: String,
    creator: String,
}

#[near_bindgen]
#[derive(Default, BorshDeserialize, BorshSerialize)]
pub struct GeoCoinContract {
    counter: u64,
    coins: HashMap<u64, GeoCoin>,
    coins_by_owner: HashMap<String, Vec<u64>>,
    allowances: HashMap<String, Vec<u64>>,
}

#[near_bindgen]
impl GeoCoinContract {
    pub fn mint_new(&mut self, bio: String) -> Option<u64> {
        if bio.chars().count() > 140 {
            return None
        }
        let id = self.counter;
        self.coins.insert(id, GeoCoin {
            holder: env::signer_account_id(),
            bio: bio.clone(),
            creator: env::signer_account_id(),
        });
        match self.coins_by_owner.get_mut(&env::signer_account_id()) {
            Some(coins) => {
                coins.push(id);
            }
            None => {
                let coins = vec![id];
                self.coins_by_owner.insert(env::signer_account_id(), coins);
            }
        };
        self.counter += 1;
        Some(id)
    }   

    pub fn mint_copy(&mut self, coin_id: u64) -> Option<u64> {
        let bio = match self.coins.get(&coin_id) {
            Some(coin) => coin.bio.clone(),
            None => return None
        };
        let id = self.counter;
        self.coins.insert(id, GeoCoin {
            holder: env::signer_account_id(),
            bio: bio,
            creator: env::signer_account_id(),
        });
        match self.coins_by_owner.get_mut(&env::signer_account_id()) {
            Some(coins) => {
                coins.push(id);
            }
            None => {
                let coins = vec![id];
                self.coins_by_owner.insert(env::signer_account_id(), coins);
            }
        };
        self.counter += 1;
        Some(id)
    }
    
    pub fn approve(&mut self, spender: String, coin_id: u64) -> bool {
        // make sure coin exists
        match self.coins.get(&coin_id) {
            Some(_) => {},
            None => return false
        };
        match self.allowances.get_mut(&spender) {
            Some(coins) => coins.push(coin_id),
            None => {
                let coins = vec![coin_id];
                self.allowances.insert(spender, coins);
            }
        };
        true
    }

    fn do_transfer(&mut self, to: String, from: String, coin_id: u64) -> bool {
        // update coin holder
        let coin = match self.coins.get_mut(&coin_id) {
            Some(coin) => {
                coin.holder = to.clone();
                coin
            },
            None => return false
        };
        // remove from from's coins
        match self.coins_by_owner.get_mut(&from) {
            Some(coins) => {
                let i = match coins.binary_search(&coin_id) {
                    Ok(i) => i,
                    Err(_) => return false
                };
                coins.remove(i);
            }
            None => {
                // undo changing of coin & return early
                coin.holder = from;
                return false
            }
        };
        // add to to's coins
        match self.coins_by_owner.get_mut(&to) {
            Some(coins) => {
                match coins.binary_search(&coin_id) {
                    Ok(_) => return true, // already holds the coin
                    Err(_) => {} // doesn't hold the coin yet
                };
                coins.push(coin_id);
            },
            None => {
                let coins = vec![coin_id];
                self.coins_by_owner.insert(to, coins);
            }
        };
        return true
    }

    pub fn transfer_from(&mut self, to: String, from: String, coin_id: u64) -> bool {
        // check to make sure allowance exists
        match self.allowances.get_mut(&env::signer_account_id()) {
            Some(coins) => match coins.binary_search(&coin_id) {
                Ok(i) => {
                    coins.remove(i);
                }
                Err(_) => return false
            },
            None => return false
        };
        let res = self.do_transfer(to, from, coin_id);
        if !res {
            // panic if we can't repair the state
            let coins = self.allowances.get_mut(&env::signer_account_id()).unwrap();
            coins.push(coin_id);
            return false
        }
        true
    }

    pub fn transfer(&mut self, to: String, coin_id: u64) -> Option<u64> {
        // make sure coin exists and is owned by signer_account_id
        match self.coins.get_mut(&coin_id) {
            Some(coin) => match coin.holder == env::signer_account_id() {
                true => {},
                false => return None,
            },
            None => return None,
        };
        match self.do_transfer(to, env::signer_account_id(), coin_id) {
            true => Some(coin_id),
            false => None
        }
    }

}



// #[cfg(not(target_arch = "wasm32"))]
// #[cfg(test)]
// mod tests {
//     use super::*;
//     use near_bindgen::MockedBlockchain;
//     use near_bindgen::{testing_env, VMContext};

//     fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
//         VMContext {
//             current_account_id: "alice_near".to_string(),
//             signer_account_id: "bob_near".to_string(),
//             signer_account_pk: vec![0, 1, 2],
//             predecessor_account_id: "carol_near".to_string(),
//             input,
//             block_index: 0,
//             block_timestamp: 0,
//             account_balance: 0,
//             account_locked_balance: 0,
//             storage_usage: 0,
//             attached_deposit: 0,
//             prepaid_gas: 10u64.pow(18),
//             random_seed: vec![0, 1, 2],
//             is_view,
//             output_data_receivers: vec![],
//         }
//     }

//     #[test]
//     fn set_get_message() {
//         let context = get_context(vec![], false);
//         testing_env!(context);
//         let mut contract = Welcome::default();
//         contract.set_greeting("howdy".to_string());
//         assert_eq!("howdy bob_near".to_string(), contract.welcome("bob_near".to_string()).text);
//     }

//     #[test]
//     fn get_nonexistent_message() {
//         let context = get_context(vec![], true);
//         testing_env!(context);
//         let contract = Welcome::default();
//         assert_eq!("Hello francis.near".to_string(), contract.welcome("francis.near".to_string()).text);
//     }
// }
