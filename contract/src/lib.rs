use near_sdk::{near_bindgen, env};
use borsh::{BorshDeserialize, BorshSerialize};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Default, PartialEq, PartialOrd, Eq, Hash, Serialize, Deserialize, BorshDeserialize, BorshSerialize, Clone)]
pub struct LogEntry {
    geocacher: String, // geocacher's account id
    date: String, // date signed
    message: String, // a friendly message :)
}
#[derive(Debug, Default, Hash,  Serialize, Deserialize, BorshDeserialize, BorshSerialize, Clone)]
pub struct Geocache {
    log: Vec<LogEntry>,
    owner: String,
    name: String,
    latitude: String,
    longitude: String,
}

#[derive(Debug, PartialEq, PartialOrd, Eq, Hash, Serialize, Deserialize, BorshDeserialize, BorshSerialize, Clone)]
pub struct Geode {
    holder: String,
    bio: String,
    creator: String,
    img: String, // IPFS hash of geode image
}

#[near_bindgen]
#[derive(Default, Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
pub struct GeodesContract {
    counter: u64,
    caches: HashMap<String, Geocache>,
    geodes: HashMap<u64, Geode>,
    geodes_by_owner: HashMap<String, Vec<u64>>,
    allowances: HashMap<String, Vec<u64>>,
    
}

#[near_bindgen]
impl GeodesContract {

    pub fn get_cache(&self, cache_id: String) -> Option<Geocache> {
        match self.caches.get(&cache_id) {
            Some(cache) => Some(cache.clone()),
            None => None
        }
    }

    pub fn get_geode(&self, geode_id: u64) -> Option<Geode> {
        match self.geodes.get(&geode_id) {
            Some(geode) => Some(geode.clone()),
            None => None
        }
    }

    pub fn get_geode_ids_by_owner(&self, owner: String) -> Option<Vec<u64>> {
        match self.geodes_by_owner.get(&owner) {
            Some(geodes) => Some(geodes.to_vec()),
            None => None,
        }
    }    

    pub fn create_cache(&mut self, name: String, latitude: String, longitude: String) -> Option<String> {
        // cache_id = name.signer_account_id
        let mut cache_id = name.clone().to_owned();
        // replace spaces with dashes
        cache_id = str::replace(&cache_id, " ", "-");
        // remove apostrophes
        cache_id = str::replace(&cache_id, "'", "");
        let cache_name = cache_id.clone();
        // name can't be empty
        if cache_name.len() < 1 {
            return None
        }
        cache_id.push('.');
        cache_id.push_str(&env::signer_account_id());
        // make sure it doesn't already exist
        if self.caches.contains_key(&cache_id) {
            return None
        };
        self.caches.insert(cache_id.clone(), Geocache {
            log: vec![],
            owner: env::signer_account_id().clone(),
            name: cache_name,
            latitude: latitude.clone(),
            longitude: longitude.clone(),
        });
        Some(cache_id.clone())
    }

    pub fn sign_cache(&mut self, cache_id: String, message: String) -> bool {
        let log_entry = LogEntry {
            geocacher: env::signer_account_id(),
            date: env::block_timestamp().to_string(),
            message: message
        };
        match self.caches.get_mut(&cache_id) {
            Some(cache) => {
                cache.log.push(log_entry);
                true
            }
            None => false
        }
    }

    pub fn add_geode_to_cache(&mut self, cache_id: String, geode_id: u64) -> bool {
        self.transfer(cache_id, geode_id)
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

    pub fn mint_new(&mut self, bio: String, img: String) -> Option<u64> {
        if bio.chars().count() > 280 {
            return None
        }
        let id = self.counter;
        self.geodes.insert(id, Geode {
            holder: env::signer_account_id(),
            bio: bio.clone(),
            creator: env::signer_account_id(),
            img: img.clone(),
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
        let (bio, img) = match self.geodes.get(&geode_id) {
            Some(geode) => (geode.bio.clone(), geode.img.clone()),
            None => return None
        };
        let id = self.counter;
        self.geodes.insert(id, Geode {
            holder: env::signer_account_id(),
            bio: bio,
            creator: env::signer_account_id(),
            img: img,
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
                return false;
            }
        };
        // add to to's geodes
        match self.geodes_by_owner.get_mut(&to) {
            Some(geodes) => {
                let i = match geodes.binary_search(&geode_id) {
                    Ok(_) => return true, // already holds the geode
                    Err(i) => i // doesn't hold the geode yet
                };
                geodes.insert(i, geode_id);
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

    pub fn transfer(&mut self, to: String, geode_id: u64) -> bool {
        // make sure geode exists and is owned by signer_account_id
        match self.geodes.get_mut(&geode_id) {
            Some(geode) => match geode.holder == env::signer_account_id() {
                true => {},
                false => return false,
            },
            None => return false,
        };
        match self.do_transfer(to, env::signer_account_id(), geode_id) {
            true => true,
            false => false
        }
    }

}



#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext};

    fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
        VMContext {
            current_account_id: "alice".to_string(),
            signer_account_id: "bob".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "carol".to_string(),
            input,
            epoch_height: 0,
            block_index: 0,
            block_timestamp: 0,
            account_balance: 0,
            account_locked_balance: 0,
            storage_usage: 0,
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view,
            output_data_receivers: vec![],
        }
    }

    fn get_context_carol(input: Vec<u8>, is_view: bool) -> VMContext {
        VMContext {
            current_account_id: "alice".to_string(),
            signer_account_id: "carol".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "bob".to_string(),
            input,
            epoch_height: 0,
            block_index: 0,
            block_timestamp: 0,
            account_balance: 0,
            account_locked_balance: 0,
            storage_usage: 0,
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view,
            output_data_receivers: vec![],
        }
    }
    
    #[test]
    fn mint_geode_smoke() {
        let context = get_context(vec![], false);
        let bob = context.signer_account_id.clone();
        testing_env!(context);
        let mut contract = GeodesContract::default();
        let bio = "It's a dangerous business, Frodo, going out your door. You step onto the road, and if you don't keep your feet, there's no knowing where you might be swept off to.".to_string();
        let id = contract.mint_new(bio.clone(), "geode_0.png".to_string()).unwrap();
        let geode = contract.geodes.get(&id);
        assert_ne!(geode, None);
        assert_eq!(bio, geode.unwrap().bio);
        let bob_geodes = contract.geodes_by_owner.get(&bob).unwrap();
        assert!(match bob_geodes.binary_search(&id) {
            Ok(_) => true,
            Err(_) => false
        })
    }

    #[test]
    fn mint_copy_smoke() {
        let context = get_context(vec![], false);
        let bob = context.signer_account_id.clone();
        testing_env!(context);
        let mut contract = GeodesContract::default();
        let template_id = contract.mint_new("mint copy smoke".to_string(), "geode_0.png".to_string()).unwrap();
        let copy_id = contract.mint_copy(template_id).unwrap();
        let template = contract.geodes.get(&template_id).unwrap();
        let copy = contract.geodes.get(&copy_id).unwrap();
        assert_eq!(template, copy);
        let bob_geodes = contract.geodes_by_owner.get(&bob).unwrap();
        assert!(match bob_geodes.binary_search(&copy_id) {
            Ok(_) => true,
            Err(_) => false
        })
    }

    #[test]
    fn transfer_smoke() {
        let context = get_context(vec![], false);
        let bob = context.signer_account_id.clone();
        let carol = context.predecessor_account_id.clone();
        testing_env!(context);
        let mut contract = GeodesContract::default();
        let id = contract.mint_new("transfer smoke".to_string(), "geode_0.png".to_string()).unwrap();
        // it doesn't fail
        assert!(contract.transfer(carol.clone(), id));
        let carol_geodes = contract.geodes_by_owner.get(&carol).unwrap();
        let bob_geodes = contract.geodes_by_owner.get(&bob).unwrap();
        // carol has the geode, bob doesn't
        assert!(match carol_geodes.binary_search(&id) {
            Ok(_) => true,
            Err(_) => false
        });
        assert!(match bob_geodes.binary_search(&id) {
            Ok(_) => false,
            Err(_) => true
        });
        // geode's holder is carol
        assert_eq!(contract.geodes.get(&id).unwrap().holder, carol);
    }

    #[test]
    fn approve_smoke() {
        let context = get_context(vec![], false);
        let bob = context.signer_account_id.clone();
        let carol = context.predecessor_account_id.clone();
        testing_env!(context);
        let mut contract = GeodesContract::default();
        // bob makes a geode
        let id = contract.mint_new("approve smoke".to_string(), "geode_0.png".to_string()).unwrap();
        // bob approves carol to take geode
        assert!(contract.approve(carol.clone(), id));
        // bob still owns geode
        assert!(match contract.geodes_by_owner.get(&bob) {
            Some(geodes) => match geodes.binary_search(&id) {
                Ok(_) => true,
                Err(_) => false,
            },
            None => false
        });
        // allowances[carol] includes geode
        assert!(match contract.allowances.get(&carol) {
            Some(geodes) => match geodes.binary_search(&id) {
                Ok(_) => true,
                Err(_) => false,
            },
            None => false
        });
    }

    #[test]
    fn transfer_from_smoke() {
        let context = get_context(vec![], false);
        let bob = context.signer_account_id.clone();
        let carol = context.predecessor_account_id.clone();
        testing_env!(context);
        let mut contract = GeodesContract::default();
        // bob makes a geode
        let id = contract.mint_new("transfer_from smoke".to_string(), "geode_0.png".to_string()).unwrap();
        // bob approves carol to take geode
        contract.approve(carol.clone(), id);
        // carol takes geode
        let context_carol = get_context_carol(vec![], false);
        testing_env!(context_carol);
        assert!(contract.transfer_from(carol.clone(), bob.clone(), id));
        // carol has the geode, bob doesn't
        let carol_geodes = contract.geodes_by_owner.get(&carol).unwrap();
        let bob_geodes = contract.geodes_by_owner.get(&bob).unwrap();
        assert!(match carol_geodes.binary_search(&id) {
            Ok(_) => true,
            Err(_) => false
        });
        assert!(match bob_geodes.binary_search(&id) {
            Ok(_) => false,
            Err(_) => true
        });
        // goede no longer in carol's allowance
        assert!(match contract.allowances.get(&carol) {
            Some(geodes) => match geodes.binary_search(&id) {
                Ok(_) => false,
                Err(_) => true,
            },
            None => false
        });
    }

    #[test]
    fn create_cache_smoke() {
        let context = get_context(vec![], false);
        let bob = context.signer_account_id.clone();
        testing_env!(context);
        let mut contract = GeodesContract::default();
        // create cache
        let cache_id = contract.create_cache("bob's super awesome geocache".to_string(), "0".to_string(), "0".to_string()).unwrap();
        // cache id is correct
        assert_eq!(cache_id, "bobs-super-awesome-geocache.bob".to_string());
        // cache was created
        assert!(contract.caches.contains_key(&cache_id));
        // cache has correct owner
        assert_eq!(bob, match contract.caches.get(&cache_id) {
            Some(cache) => cache.owner.clone(),
            None => "".to_string()
        });
        // cache has correct name
        assert_eq!("bobs-super-awesome-geocache".to_string(), match contract.caches.get(&cache_id) {
            Some(cache) => cache.name.clone(),
            None => "".to_string()
        });
    }

    #[test]
    fn sign_cache_smoke() {
        let context = get_context(vec![], false);
        let carol = context.predecessor_account_id.clone();
        testing_env!(context);
        let mut contract = GeodesContract::default();
        // bob makes cache
        let cache_id = contract.create_cache("bob's super awesome geocache".to_string(), "0".to_string(), "0".to_string()).unwrap();
        // carol signs cache log
        let context_carol = get_context_carol(vec![], false);
        testing_env!(context_carol);
        assert!(contract.sign_cache(cache_id.clone(), "Check out the cool geocache I found!".to_string()));
        // cache log was updated with correct information
        let log_index: Option<usize> = match contract.caches.get(&cache_id) {
            Some(cache) => match cache.log.binary_search_by_key(&carol, |elem| { elem.geocacher.clone() }) {
                Ok(i) => Some(i),
                Err(_) => None
            },
            None => None
        };
        assert_ne!(None, log_index);
        let i = log_index.unwrap();
        // cache log was updated with correct message
        assert_eq!("Check out the cool geocache I found!".to_string(), match contract.caches.get(&cache_id) {
            Some(cache) => cache.log[i].message.clone(),
            None => "".to_string(),
        })
    }

    #[test]
    fn add_geode_to_cache_smoke() {
        let context = get_context(vec![], false);
        let carol = context.predecessor_account_id.clone();
        testing_env!(context);
        let mut contract = GeodesContract::default();
        // bob makes cache
        let cache_id = contract.create_cache("bob's super awesome geocache".to_string(), "0".to_string(), "0".to_string()).unwrap();
        // carol makes a geode
        let context_carol = get_context_carol(vec![], false);
        testing_env!(context_carol);
        let geode_id = contract.mint_new("This is Carol's cool rock".to_string(), "geode_0.png".to_string()).unwrap();
        // carol adds it to the cache
        assert!(contract.add_geode_to_cache(cache_id.clone(), geode_id.clone()));
        let carol_geodes = contract.geodes_by_owner.get(&carol).unwrap();
        let cache_geodes = contract.geodes_by_owner.get(&cache_id).unwrap();
        // cache owns the geode, carol doesn't
        assert!(match cache_geodes.binary_search(&geode_id) {
            Ok(_) => true,
            Err(_) => false
        });
        assert!(match carol_geodes.binary_search(&geode_id) {
            Ok(_) => false,
            Err(_) => true
        });
    }

    #[test]
    fn trade_with_cache_smoke() {
        let context = get_context(vec![], false);
        let carol = context.predecessor_account_id.clone();
        testing_env!(context);
        let mut contract = GeodesContract::default();
        // bob makes cache
        let cache_id = contract.create_cache("bob's super awesome geocache".to_string(), "0".to_string(), "0".to_string()).unwrap();
        // bob makes a geode and puts it in the cache
        let cache_geode = contract.mint_new("This is Bobs's cool rock".to_string(), "geode_0.png".to_string()).unwrap();
        assert!(contract.add_geode_to_cache(cache_id.clone(), cache_geode.clone()), "geode_0.png".to_string());
        // carol makes a geode
        let context_carol = get_context_carol(vec![], false);
        testing_env!(context_carol);
        let carol_geode = contract.mint_new("This is Carol's cool rock".to_string(), "geode_0.png".to_string()).unwrap();
        assert!(contract.trade_with_cache(cache_id.clone(), carol_geode, cache_geode));
        let cache_geodes = contract.geodes_by_owner.get(&cache_id).unwrap();
        // cache owns the carol's geode
        assert!(match cache_geodes.binary_search(&carol_geode) {
            Ok(_) => true,
            Err(_) => false
        });
        // cache still owns cache_geode
        assert!(match contract.geodes_by_owner.get(&cache_id) {
            Some(geodes) => match geodes.binary_search(&cache_geode) {
                Ok(_) => true,
                Err(_) => false,
            },
            None => false
        });
        // allowances[carol] includes cache_geode
        assert!(match contract.allowances.get(&carol) {
            Some(geodes) => match geodes.binary_search(&cache_geode) {
                Ok(_) => true,
                Err(_) => false,
            },
            None => false
        });
    }
}
