#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    Address,
    Env,
};

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SpayTokenContract, ());
    let client = SpayTokenContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    assert_eq!(client.admin(), admin);
    assert_eq!(client.total_supply(), 0);
}

#[test]
fn test_mint_and_balance() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SpayTokenContract, ());
    let client = SpayTokenContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let employee = Address::generate(&env);

    client.initialize(&admin);

    // Mint 1 SPAY to employee
    client.mint(&employee, &1);
    assert_eq!(client.balance(&employee), 1);
    assert_eq!(client.total_supply(), 1);

    // Mint again
    client.mint(&employee, &1);
    assert_eq!(client.balance(&employee), 2);
    assert_eq!(client.total_supply(), 2);
}

#[test]
fn test_mint_multiple_employees() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SpayTokenContract, ());
    let client = SpayTokenContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let emp1 = Address::generate(&env);
    let emp2 = Address::generate(&env);

    client.initialize(&admin);

    client.mint(&emp1, &1);
    client.mint(&emp2, &3);

    assert_eq!(client.balance(&emp1), 1);
    assert_eq!(client.balance(&emp2), 3);
    assert_eq!(client.total_supply(), 4);
}

#[test]
fn test_balance_of_unknown_address_is_zero() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SpayTokenContract, ());
    let client = SpayTokenContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let unknown = Address::generate(&env);

    client.initialize(&admin);

    assert_eq!(client.balance(&unknown), 0);
}

#[test]
fn test_double_initialize_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SpayTokenContract, ());
    let client = SpayTokenContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    // Second initialize should fail
    let result = client.try_initialize(&admin);
    assert!(result.is_err());
}
