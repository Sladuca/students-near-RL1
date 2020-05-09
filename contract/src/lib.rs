use near_sdk::{near_bindgen, env};
use borsh::{BorshDeserialize, BorshSerialize};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::prelude::*;
use std::error::Error;
use std::fmt;

// -------- GEOCACHE CONTRACT -------- //

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
}

// -------- GEOCOIN CONTRACT -------- //

#[derive(PartialEq, PartialOrd, Eq, Hash, Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
pub struct GeoCoin {
    holder: String,
    bio: String,
    creator: String,
}

#[near_bindgen]
#[derive(Default, BorshDeserialize, BorshSerialize)]
pub struct GeoCoinMint {
    counter: u64,
    coins: HashMap<u64, GeoCoin>,
    coins_by_owner: HashMap<String, Vec<GeoCoin>>
}

#[near_bindgen]
impl GeoCoinMint {
    pub fn mint_new(&mut self, bio: String) -> Option<u64> {
        if bio.chars().count() > 140 {
            return None
        }
        self.coins.insert(self.counter, GeoCoin {
            holder: env::signer_account_id(),
            bio: bio.clone(),
            creator: env::signer_account_id(),
        });
        self.counter += 1;
        match self.coins_by_owner.get_mut(&env::signer_account_id()) {
            Some(coins) => {
                coins.push(GeoCoin {
                    holder: env::signer_account_id(),
                    bio: bio.clone(),
                    creator: env::signer_account_id(),
                });
            }
            None => {
                let coin = GeoCoin {
                    holder: env::signer_account_id(),
                    bio: bio.clone(),
                    creator: env::signer_account_id(),
                };
                let coins = vec![coin];
                self.coins_by_owner.insert(env::signer_account_id(), coins);
            }
        };
        Some(10)
    }   

    pub fn mint_copy(&mut self, coinId: u64) -> Option<u64> {
        let template = match self.coins.get(&coinId) {
            Some(coin) => coin,
            None => return None
        };
        None
    }

    pub fn transfer(&mut self, to: String, coinId: String) -> Option<u64> {
        None
    }


}


// -------- GEOCACHER CONTRACT -------- //



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
