/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Meme from '../abis/Meme.json'


//const ipfsClient = require('ipfs-http-client')
//const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) 


class Latest extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    await this.getBlockDetails()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Meme.networks[networkId]
    if (networkData) {
      const contract = web3.eth.Contract(Meme.abi, networkData.address)
      this.setState({ contract })
      this.setState({ ethAddress: networkData.address })
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }


  constructor(props) {
    super(props);

    this.state = {
      memeHash: '',
      contract: null,
      web3: null,
      buffer: null,
      account: null,
      ethAddress: '',
      blockNumber: '',
      transactionHash: '',
      gasUsed: '',
      txReceipt: '',
      stored: [],
      latestbno: [],
      latesttimes: [],
      ht: true
    }

  }

  async getBlockDetails() {

    const web3 = window.web3
    let latestBlock = await web3.eth.getBlock('latest')
    //console.log('latest block', latestBlock)
    let block
    let latestBlocks = []
    let times = []
    for (let i = 0; i < latestBlock.number; i++) {
      block = await web3.eth.getBlock(latestBlock.number - i)
      //console.log(block)
      if (block.number === 4) { break; }
      latestBlocks.push(block)
      let utcSeconds = block.timestamp;
      let d = new Date(0);
      d.setUTCSeconds(utcSeconds);
      times.push(d.toString().slice(0, 25));
    }
    this.setState({
      latestbno: latestBlocks,
      latesttimes: times
    })
    console.log(this.state.latesttimes)
  }


  res = async (args) => {
    //console.log(args)
    let re = []
    for (let i = 0; i < args.length; i++) {
      console.log(args[i].returnValues[1])
      re.push(args[i].returnValues[1])
    }
    this.setState({ stored: re.reverse() })
    console.log(re)
    this.setState({ ht: false });

  }
  retrieve = async () => {

    let t = this;
    this.state.contract.getPastEvents('HashCreated', {
      fromBlock: 0,
      toBlock: 'latest'
    }, function (error, events) {
      t.res(events);
      //console.log(events);   
    })
  }

  render() {


    const images = this.state.stored.map(
      (image, index) => <img src={`https://ipfs.infura.io/ipfs/` + image} key={index} alt="" />
    )


    const style = this.state.ht ? { display: 'none' } : {};

    return (
      <div>

        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href=""
          >
            Fake Image Analysis Using BlockChain
          </a>
          <ul className="navbar-nav px-3">
            <li>
              <small className="text-white">{this.state.account}</small>
            </li>
          </ul>
        </nav>



        <div>
        <p>&nbsp;</p>
          <center>
            <h2>Latest Images in Blockchain</h2>
            <p>&nbsp;</p>
            <button onClick={this.retrieve}>Click me</button>
          </center>
          <p>&nbsp;</p>
          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#Block Number</th>
                  <th scope="col">Hash</th>
                  <th scope="col">Image</th>
                  <th scope="col">Timestamp (GMT)</th>
                </tr>
              </thead>
              <tbody style={style}>
                {this.state.latestbno.map((block, key) => {
                  return (
                    <tr key={key} >
                      <th scope="row">{block.number}</th>
                      <td>{block.hash.substring(0, 20)}...</td>
                      <td>{images[key]}</td>
                      <td>{this.state.latesttimes[key]}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}
export default Latest;