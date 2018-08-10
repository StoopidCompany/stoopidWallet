'use strict';

// var BitcoinWallet = require("./bitcoin/bitcoin");
// var EthereumWallet = require("./ethereum/ethereum");
var BlockCypher = require("./apis/blockcypher");

// var bitcoin = new BitcoinWallet();
// var ethereum = new EthereumWallet();
var blockcypher = new BlockCypher();

/**
 * Connects our various coin protocols to deliver
 * A single endpoint to use any wallet or coin or network. 
 */
class StoopidWallet {
    /**
     * Creates the wallet and crypto globals.
     * @param {String} api - The API we'll use. Defaults to blockcypher.
     * @param {String} crypto - The coin we're using. Defaults to bitcoin.
     */
    constructor(api = "blockcypher",crypto = "bitcoin") {
        this.wallet = {
            bitcoin: {},
            ethereum: {}
        };
        this.crypto = crypto;
        if(api === "blockcypher") this.api = new BlockCypher();
    }

    /**
     * Sets the active crypto for use.
     * @param {String} crypto - The type of coin we're going to work.
     * @returns {String} - Confirmation of the set crypto type. 
     */
    setCrypto(crypto) {
        this.crypto = crypto;
        this.api.crypto = crypto;
        return this.crypto;
    }

    /**
     * Gets the active crypto or wallet type.
     * @returns {String} - The active crypto being used. 
     */
    getCrypto() {
        return this.crypto;
    }

    /**
     * Sets the active API for use.
     * @param {String} api - The API we're interacting with.
     * @returns {String} - Confirmation of the set API type. 
     */
    setApi(api) {
        if(api === 'blockcypher') this.api = new BlockCypher(this.crypto);

        return this.api.name;
    }

    /**
     * Gets the active API.
     * @returns {String} - The active API being used. 
     */
    getApi() {
        return this.api.name;
    }

    /**
     * Gets the latest block number for the set network
     * @returns {Number} - The latest block number.
     */
    getLastBlockNumber() {
        return new Promise((resolve,reject) => {
            this.api.getLastBlockNumber().then(function(number) {
                resolve(number);
            }).catch(function(err) {
                reject(err);
            })
        })
    }

    /**
     * Gets a block object from the current network by block number
     * @param {Number} - The block number
     * @returns {Promise<Object>} - The block object
     */
    getBlock(number) {
        return new Promise((resolve,reject) => {
            this.api.getBlock(number).then(function(block) {
                resolve(block);
            }).catch(function(err) {
                reject(err);
            })
        });
    }

    /**
     * Gets all available wallets and returns them.
     * @returns {Object} - The full wallet object. 
     */
    getAllWallets() {
        return this.wallet;
    }

    /**
     * Gets the active wallet.
     * @returns {Object} - The active wallet object. 
     */
    getWallet() {
        if(this.crypto === 'bitcoin') return this.wallet.bitcoin;
        if(this.crypto === 'ethereum') return this.wallet.ethereum;
    }

    /**
     * Gets the active wallet.
     * @returns {Promise<Number>} - The balance of the active wallet 
     */
    getBalance() {
        return new Promise((resolve, reject) => {
            if(this.crypto === 'bitcoin') {
                bitcoin.getBalance(this.wallet.bitcoin.address).then(function(bal) {
                    resolve(bal);
                })
            }
            if(this.crypto === 'ethereum') {
                ethereum.getBalance(this.wallet.ethereum.address).then(function(bal) {
                    resolve(bal);
                })
            }
        })
    }

    /**
     * Creates or re-creates a wallet for the active crypto
     * @param {String} network - The network for the wallet. 
     * @param {String} key - The private key for an existing wallet.
     * @returns {Promise<Object>} - The active wallet object. 
     */
    createWallet(network='',key=0) {
        if(this.crypto === 'bitcoin') this.wallet.bitcoin = bitcoin.createWallet(network,key);
        if(this.crypto === 'ethereum'){
            if(key === 0) {
                this.wallet.ethereum = ethereum.createWallet();
            } else {
                this.wallet.ethereum = ethereum.importWallet(key);
            }
        }

        return new Promise((resolve,reject) => {
            if(this.wallet === {}) reject("error, There is no wallet!");

            resolve(this.wallet);
        })
    }

    /**
     * Creates and sends a transaction for the current active crypto.
     * @param {Number} amount - The amount to send.
     * @param {String} toAddr - The address to send crypto too.
     * @returns {Promise<String>} - The transaction hash.
     */
    sendCoin(amount,toAddr) {
        return new Promise((resolve, reject) => {
            if(this.crypto === 'bitcoin') {
                bitcoin.sendBitcoin(amount,toAddr,this.wallet.bitcoin).then(function(result) {
                    resolve(result);
                })
            }

            /** @todo cleanup eth transaction calls */
            if(this.crypto === 'ethereum') {
                ethereum.createTransaction(toAddr,amount,this.wallet.ethereum).then(function(result) {
                    return result;
                }).then(function(transaction) {
                    ethereum.sendTransaction(transaction.rawTransaction).then(function(res) {
                        resolve(res);
                    }).catch(function(err) {
                        reject(err);
                    })
                }).catch(function(err) {
                    reject(err);
                })
            }
        })
    }
}

module.exports = StoopidWallet;