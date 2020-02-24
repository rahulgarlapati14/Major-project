/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Meme from '../abis/Meme.json'


const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) 


class Ver extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
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
    if(networkData) {
      const contract = web3.eth.Contract(Meme.abi, networkData.address)
      this.setState({ contract })
      const memeHash = await contract.methods.get().call()
      this.setState({ memeHash })
      this.setState({ethAddress:networkData.address})
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  state = {
      memeHash: '',
      contract: null,
      web3: null,
      buffer: null,
      account: null,
      ethAddress:'',
      blockNumber:'',
      transactionHash:'',
      gasUsed:'',
      txReceipt: '' 
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
      console.log('buffer', this.state.buffer)
    }
  }

//2
  onSubmit = (event) => {
    
    event.preventDefault()
    console.log("Submitting file to ipfs...")
    
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }
      
      this.state.contract.methods.set(result[0].hash).send({ from: this.state.account }, (error, transactionHash) => {
        console.log(transactionHash);
        this.setState({transactionHash});
      }).then((r) => {
         return this.setState({ memeHash: result[0].hash })
       })
    })
  }
//

  onSelect = async () => {
    const web3 = window.web3
    try{
            this.setState({blockNumber:"waiting.."});
            this.setState({gasUsed:"waiting..."});
   
    //get Transaction Receipt in console on click
    await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt)=>{
              console.log(err,txReceipt);
              this.setState({txReceipt});
            }); //await for getTransactionReceipt
    await this.setState({blockNumber: this.state.txReceipt.blockNumber});
            await this.setState({gasUsed: this.state.txReceipt.gasUsed});    
          } //try
        catch(error){
            console.log(error);
          } //catch

  } //onClick


  render() {

    return  (
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
                <a
                  href=""
                >
               <center> <img alt="Stored img" src={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`} /></center>
                </a>
                <p>&nbsp;</p>
                <h2>Upload Image</h2>
                <p>&nbsp;</p>
                <form onSubmit={this.onSubmit} >
                  <input type='file' onChange={this.captureFile} />   
                  <input type='submit' value="Upload" />
                </form>
                
                <p>&nbsp;</p>
  <button onClick = {this.onSelect}> Get Transaction Receipt </button>
  <table width="120%">
                <thead>
                  <tr>
                    <th>Tx Receipt Category</th>
                    <th>Values</th>
                  </tr>
                </thead>
               
                <tbody>
                  <tr>
                    <td>IPFS Hash Stored on Eth Contract</td>
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
                    <td>Gas Used</td>
                    <td>{this.state.gasUsed}</td>
                  </tr>
                
                </tbody>
            </table>

              </div>
            </main>
          </div>
        </div>
      </div>
    );  
}
}
export default Ver;
