#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    symbol_short, Address, Env,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum SpayError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Balance(Address),
    TotalSupply,
    Initialized,
}

#[contract]
pub struct SpayTokenContract;

#[contractimpl]
impl SpayTokenContract {
    /// Initialize the SPAY token with an admin address.
    /// Only the admin (Treasury contract) can mint tokens.
    pub fn initialize(env: Env, admin: Address) -> Result<(), SpayError> {
        // Prevent double initialization
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(SpayError::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalSupply, &0i128);
        env.storage().instance().set(&DataKey::Initialized, &true);

        env.events().publish(
            (symbol_short!("init"),),
            admin,
        );

        Ok(())
    }

    /// Mint SPAY tokens to a recipient. Only callable by admin (Treasury).
    pub fn mint(env: Env, to: Address, amount: i128) -> Result<(), SpayError> {
        // Verify initialized
        if !env.storage().instance().has(&DataKey::Initialized) {
            return Err(SpayError::NotInitialized);
        }

        // Verify caller is admin
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        if amount <= 0 {
            return Err(SpayError::InvalidAmount);
        }

        // Update recipient balance
        let current_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance(to.clone()))
            .unwrap_or(0);

        env.storage()
            .persistent()
            .set(&DataKey::Balance(to.clone()), &(current_balance + amount));

        // Update total supply
        let supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);

        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(supply + amount));

        // Emit event
        env.events().publish(
            (symbol_short!("minted"), to.clone()),
            amount,
        );

        Ok(())
    }

    /// Get the SPAY balance of an address.
    pub fn balance(env: Env, address: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(address))
            .unwrap_or(0)
    }

    /// Get the total supply of SPAY tokens.
    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    /// Get the admin address.
    pub fn admin(env: Env) -> Result<Address, SpayError> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(SpayError::NotInitialized)
    }
}

#[cfg(test)]
mod test;
