require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    //For project use
   development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    }
    //For testing
   /* development: {
      host: "192.168.43.161",
      port: 7887,
      network_id:5666
    }*/
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
