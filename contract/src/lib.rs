use near_sdk::{near_bindgen, env};
use borsh::{BorshDeserialize, BorshSerialize};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{Utc};

#[derive(PartialEq, PartialOrd, Eq, Hash, Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
pub struct LogEntry {
    geocacher: String, // geocacher's account id
    date: String, // date signed
    message: String, // a friendly message :)
}
#[derive(Default, Hash, BorshDeserialize, BorshSerialize)]
pub struct Geocache {
    log: Vec<LogEntry>,
    owner: String,
    name: String,
}

#[derive(PartialEq, PartialOrd, Eq, Hash, Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
pub struct Geode {
    holder: String,
    bio: String,
    creator: String,
}

#[near_bindgen]
#[derive(Default, BorshDeserialize, BorshSerialize)]
pub struct GeodesContract {
    counter: u64,
    caches: HashMap<String, Geocache>,
    geodes: HashMap<u64, Geode>,
    geodes_by_owner: HashMap<String, Vec<u64>>,
    allowances: HashMap<String, Vec<u64>>,
    
}

#[near_bindgen]
impl GeodesContract {

    pub fn sign_cache(&mut self, cache_id: String, message: String) -> bool {
        let logEntry = LogEntry {
            geocacher: env::signer_account_id(),
            date: Utc::now().to_string(),
            message: message
        };
        match self.caches.get_mut(cache_id) {
            Some(cache) => {
                cache.log.push(logEntry);
                true
            }
            None => false
        }
    }

    pub fn add_geode_to_cache(&mut self, cache_id: String, geode_id: u64) -> bool {
        // remove from owner's list
        match self.geodes_by_owner.get(&env::signer_account_id()) {
            Some(geodes) => match geodes.binary_search(geode_id) {
                Ok(i) => geodes.remove(i),
                Err(_) => return false,
            }
            None => return false
        }
        // do transfew
        self.do_transfer(cache_id, env::signer_account_id(), geode_id)
    }

    pub fn trade_with_cache(&mut self, cache_id: String, give: u64, take: u64) -> bool {
        // transfer give
        match self.transfer(cache_id, give) {
            true => {},
            false => return false
        };
        // approve take
        self.approve(env::signer_account_id(), take)
    }

    pub fn mint_new(&mut self, bio: String) -> Option<u64> {
        if bio.chars().count() > 140 {
            return None
        }
        let id = self.counter;
        self.geodes.insert(id, Geode {
            holder: env::signer_account_id(),
            bio: bio.clone(),
            creator: env::signer_account_id(),
        });
        match self.geodes_by_owner.get_mut(&env::signer_account_id()) {
            Some(geodes) => {
                geodes.push(id);
            }
            None => {
                let geodes = vec![id];
                self.geodes_by_owner.insert(env::signer_account_id(), geodes);
            }
        };
        self.counter += 1;
        Some(id)
    }

    pub fn mint_copy(&mut self, geode_id: u64) -> Option<u64> {
        let bio = match self.geodes.get(&geode_id) {
            Some(geode) => geode.bio.clone(),
            None => return None
        };
        let id = self.counter;
        self.geodes.insert(id, Geode {
            holder: env::signer_account_id(),
            bio: bio,
            creator: env::signer_account_id(),
        });
        match self.geodes_by_owner.get_mut(&env::signer_account_id()) {
            Some(geodes) => {
                geodes.push(id);
            }
            None => {
                let geodes = vec![id];
                self.geodes_by_owner.insert(env::signer_account_id(), geodes);
            }
        };
        self.counter += 1;
        Some(id)
    }
    
    pub fn approve(&mut self, spender: String, geode_id: u64) -> bool {
        // make sure geode exists
        match self.geodes.get(&geode_id) {
            Some(_) => {},
            None => return false
        };
        match self.allowances.get_mut(&spender) {
            Some(geodes) => geodes.push(geode_id),
            None => {
                let geodes = vec![geode_id];
                self.allowances.insert(spender, geodes);
            }
        };
        true
    }

    fn do_transfer(&mut self, to: String, from: String, geode_id: u64) -> bool {
        // update geode holder
        let geode = match self.geodes.get_mut(&geode_id) {
            Some(geode) => {
                geode.holder = to.clone();
                geode
            },
            None => return false
        };
        // remove from from's geodes
        match self.geodes_by_owner.get_mut(&from) {
            Some(geodes) => {
                let i = match geodes.binary_search(&geode_id) {
                    Ok(i) => i,
                    Err(_) => return false
                };
                geodes.remove(i);
            }
            None => {
                // undo changing of geode & return early
                geode.holder = from;
                return false
            }
        };
        // add to to's geodes
        match self.geodes_by_owner.get_mut(&to) {
            Some(geodes) => {
                match geodes.binary_search(&geode_id) {
                    Ok(_) => return true, // already holds the geode
                    Err(_) => {} // doesn't hold the geode yet
                };
                geodes.push(geode_id);
            },
            None => {
                let geodes = vec![geode_id];
                self.geodes_by_owner.insert(to, geodes);
            }
        };
        return true
    }

    pub fn transfer_from(&mut self, to: String, from: String, geode_id: u64) -> bool {
        // check to make sure allowance exists
        match self.allowances.get_mut(&env::signer_account_id()) {
            Some(geodes) => match geodes.binary_search(&geode_id) {
                Ok(i) => {
                    geodes.remove(i);
                }
                Err(_) => return false
            },
            None => return false
        };
        let res = self.do_transfer(to, from, geode_id);
        if !res {
            // panic if we can't repair the state
            let geodes = self.allowances.get_mut(&env::signer_account_id()).unwrap();
            geodes.push(geode_id);
            return false
        }
        true
    }

    pub fn transfer(&mut self, to: String, geode_id: u64) -> Option<u64> {
        // make sure geode exists and is owned by signer_account_id
        match self.geodes.get_mut(&geode_id) {
            Some(geode) => match geode.holder == env::signer_account_id() {
                true => {},
                false => return None,
            },
            None => return None,
        };
        match self.do_transfer(to, env::signer_account_id(), geode_id) {
            true => Some(geode_id),
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
