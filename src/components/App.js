/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Meme from '../abis/Meme.json'


const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })


class App extends Component {

  // is executed before rendering, on both the server and the client side.
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    await this.retEvents()
  }

  async loadWeb3() {
    //connecting app in browser to ganache blockchain

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
    // get accounts from metamask in browser
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const networkData = Meme.networks[networkId]
    if (networkData) {
      const contract = web3.eth.Contract(Meme.abi, networkData.address)

      this.setState({ contract })
      this.setState({ ethAddress: networkData.address })
    }
    else {
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
      timestamp: '',
      ht: true,
      presentHashes: []
    }
  }


  retHash = async (args) => {
    //console.log(args)
    let re = []
    for (let i = 0; i < args.length; i++) {
      //console.log(args[i].returnValues[1])
      re.push(args[i].returnValues[1])
    }
    re.reverse()
    console.log(re)
    this.setState({ presentHashes: re })

  }

  retEvents = async () => {

    let t = this;
    this.state.contract.getPastEvents('HashCreated', {
      fromBlock: 0,
      toBlock: 'latest'
    }, function (error, events) {
      t.retHash(events);
      //console.log(events); 
    })
  }

  checkDuplicate = async (args) => {

    if (this.state.presentHashes.indexOf(args) < 0)
      this.setState({ check: false })
    else
      this.setState({ check: true })
  }


  //1
  captureFile = (event) => {

    event.preventDefault()
    // Process Files For IPFS
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('Buffer result of Image', this.state.buffer)
      alert("Image Uploaded,Please Click Upload To Proceed")
    }
  }

  //2
  onSubmit = (event) => {

    event.preventDefault()
    console.log("Submitting file to IPFS...")

    ipfs.add(this.state.buffer, (error, result) => {
      console.log('IPFS result', result)
      // this.setState({ memeHash: result[0].hash })
      if (error) {
        //console.error(error)
        alert("Please Upload Image amd then Click Upload");
        return
      }
      this.checkDuplicate(result[0].hash);

      if (this.state.check) {
        alert("This Image is Aready Present In Blockchain");
        return
      }
      else {
        this.state.contract.methods.set(result[0].hash).send({ from: this.state.account }, (error, transactionHash) => {
          console.log(transactionHash);
          this.setState({ transactionHash });
          this.setState({ memeHash: result[0].hash })
        })
      }
    })

  }
  //

  onSelect = async () => {


    const web3 = window.web3
    try {
      this.setState({ blockNumber: "waiting.." });
      this.setState({ gasUsed: "waiting..." });

      //get Transaction Receipt in console on click
      await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt) => {
        console.log(err, txReceipt);
        this.setState({ txReceipt });
      }); //await for getTransactionReceipt
      await this.setState({ blockNumber: this.state.txReceipt.blockNumber });
      await this.setState({ gasUsed: this.state.txReceipt.gasUsed });

      await web3.eth.getBlock(this.state.blockNumber, (err, blk) => {
        console.log(err, blk.timestamp);
        let utcSeconds = blk.timestamp;
        let d = new Date(0);
        d.setUTCSeconds(utcSeconds);
        this.setState({ timestamp: d.toString() });

      })

      this.setState({ ht: false });
    }
    catch (error) {
      console.log(error);
      alert("First Upload Image To Get Transaction Details")
    }

  }


  render() {

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

        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">

                <h2>Upload Image To Blockchain</h2>
                <p>&nbsp;</p>
                <form onSubmit={this.onSubmit} >
                  <input type='file' onChange={this.captureFile} />
                  <input type='submit' value="Upload" />
                </form>

                <div id="upimg">
                  &nbsp;&nbsp;&nbsp;&nbsp;
                <center>
                    <h2>Uploaded Image in Blockchain</h2>
                    <img alt="" src={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`} />
                  </center>

                </div>

                <p>&nbsp;&nbsp;&nbsp;&nbsp;</p>
                <button onClick={this.onSelect}> Get Transaction Receipt </button>


                <div><table width="120%" style={style}>
                  <thead>
                    <tr>
                      <th>Tx Receipt Category</th>
                      <center><th>Values</th></center>
                    </tr>
                  </thead>
                  
                  <tbody>
                    <tr>
                      <td>IPFS Hash of Image Stored on Eth Contract</td>
                      <td>{this.state.memeHash}</td>
                    </tr>
                    <tr>
                      <td>Ethereum Contract Address</td>
                      <td>{this.state.ethAddress}</td>
                    </tr>
                    <tr>
                      <td>Transaction Hash  </td>
                      <td>{this.state.transactionHash}</td>
                    </tr>
                    <tr>
                      <td>Block Number </td>
                      <td>{this.state.blockNumber}</td>
                    </tr>
                    <tr>
                      <td>Timestamp </td>
                      <td>{this.state.timestamp}</td>
                    </tr>

                    <tr>
                      <td>Gas Used</td>
                      <td>{this.state.gasUsed}</td>
                    </tr>

                  </tbody>
                </table></div>

              </div>
            </main>
          </div>
        </div>


      </div>
    );
  }
}
export default App;