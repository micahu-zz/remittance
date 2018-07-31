/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() {
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>')
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

require('babel-register')
require('babel-polyfill')

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8546,
      network_id: '5777' // Match any network id
    },
    web: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*' // Match any network id
    },
    coverage: {
      host: '127.0.0.1',
      network_id: '*',
      port: 8546,
      gas: 0xfffffffffff,
      gasPrice: 0x01
    }
  }
}
