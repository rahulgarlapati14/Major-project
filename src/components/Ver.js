/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Meme from '../abis/Meme.json';
import Loader from 'react-loader-spinner';



const Clarifai = require('clarifai');
const app = new Clarifai.App({
  apiKey: '37640021b4244be5a7db44148056585f'
});


const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })



class Ver extends Component {

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

      this.retEvents();
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  state = {

    contract: null,
    web3: null,
    buffer: null,
    account: null,
    ethAddress: '',
    blockNumber: '',
    transactionHash: '',
    gasUsed: '',
    txReceipt: '',
    imgURLS: [],
    fakeImage: '',
    originalImage: '',
    loading: false,
    latestbno: [],
    latesttimes: [],
    ht: true,
    simscore: ''
  }

  async getBlockDetails() {

    const web3 = window.web3
    let latestBlock = await web3.eth.getBlock('latest')
    //console.log('latest block', latestBlock)


    let block
    let latestBlocks = []
    let times = []
    let i = 0
    while (true) {
      block = await web3.eth.getBlock(latestBlock.number - i)
      //console.log(block)
      if (block.number === 4) { break; }
      latestBlocks.push(block)

      let utcSeconds = block.timestamp;
      let d = new Date(0);
      d.setUTCSeconds(utcSeconds);
      times.push(d.toString().slice(0, 25));
      i++
    }


    this.setState({
      latestbno: latestBlocks,
      latesttimes: times
    })
    console.log(this.state.latesttimes)

  }


  retHash = async (args) => {
    //console.log(args)
    let re = []
    for (let i = 0; i < args.length; i++) {
      //console.log(args[i].returnValues[1])
      re.push(`https://ipfs.infura.io/ipfs/` + args[i].returnValues[1])
    }
    this.setState({ imgURLS: re.reverse() })
    // console.log(re)

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

  //1
  captureFile = (event) => {
    event.preventDefault()
    // Process Files For IPFS
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      // console.log('buffer', this.state.buffer)
    }
  }

  //2
  onSubmit = (event) => {

    event.preventDefault()
    console.log("Submitting file to ipfs...")

    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result);
      this.verifyImage(`https://ipfs.infura.io/ipfs/` + result[0].hash);
      if (error) {
        console.error(error);
        return
      }

    })

  }


  verifyImage = async (upHash) => {

    this.setState({ fakeImage: upHash });
    console.log(upHash);
    this.setState({ loading: true });
    console.log(this.state.imgURLS);
    var imgURLS = this.state.imgURLS;
    await app.inputs.delete();
    for (let i = 0; i < imgURLS.length; i++) {
      await app.inputs.create([
        {
          url: imgURLS[i],
        }]).then(
          function (response) {
            console.log(response);
          },
          function (err) {
            console.log(err);
          });
    }
    let t = this;
    await app.inputs.search({ input: { url: upHash } }).then(
      function (response) {
        console.log(response.hits[0].score);
        console.log(response.hits[0].input.data.image);
        t.setState({
          originalImage: response.hits[0].input.data.image.url,
          simscore: response.hits[0].score,
          loading: false
        })

      },
      function (err) {
        console.log(err);
      }
    );
    let a = t.state.originalImage;
    let b = t.state.imgURLS;
    let c = t.state.latesttimes;
    console.log(c[b.indexOf(a)])
    this.setState({ orgimgtime: c[b.indexOf(a)] })
    this.setState({ ht: false })
  }


  render() {

    const divstyle = {
      margin: "auto",
      "padding-left": "25%"
  
    }

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
                <a
                  href=""
                >
                </a>
                <h1>Image Verification</h1>
                <p>&nbsp;</p>
                <h2>Upload Image</h2>
                <p>&nbsp;</p>
                <form onSubmit={this.onSubmit} >
                  <input type='file' onChange={this.captureFile} />
                  <input type='submit' value="Upload" />
                </form>

                <p>&nbsp;</p>
              </div>
            </main>
          </div>
        </div>

        <div style={divstyle}>
          <table width="80%">
            <tr><center>{<Loader visible={this.state.loading} type="TailSpin" height='100' width='100' />}</center></tr>
            <tr>
              <th>Uploaded Image</th>
              <th>Original Image</th>
            </tr>
            <tr>
              <td><img alt="" src={this.state.fakeImage} /></td>
              <td>
                <img alt="" src={this.state.originalImage} />
              </td>
            </tr>
            <tr style={style}>
            
            <td>
                <b>Timestamp :</b> {this.state.orgimgtime}<br />
                <b>Similarity Score :</b> {this.state.simscore}
            </td>
            </tr>

          </table>

        </div>
      </div>
    );
  }
}
export default Ver;