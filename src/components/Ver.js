/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Meme from '../abis/Meme.json';
import Loader from 'react-loader-spinner';

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) 


const deepai = require('deepai'); // OR include deepai.min.js as a script tag in your HTML

deepai.setApiKey('340ce7cb-652a-499f-8cff-dcd05c1d0d49');

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
      ethAddress:'',
      blockNumber:'',
      transactionHash:'',
      gasUsed:'',
      txReceipt: '',
      imgURLS:[],
      fakeImage:'',
      originalImage:'',
      loading:false
    }
  
    
    retHash= async(args)=>{
      //console.log(args)
      let re=[]
      for(let i=0;i<args.length;i++){
        //console.log(args[i].returnValues[1])
        re.push(`https://ipfs.infura.io/ipfs/`+args[i].returnValues[1])
      }
      this.setState({imgURLS:re})
     // console.log(re)
      
    }

 retEvents= async () =>{
     
    let t=this;
    this.state.contract.getPastEvents('HashCreated', {
      fromBlock: 0,
      toBlock: 'latest'
  },function(error, events){ 
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
      this.verifyImage(`https://ipfs.infura.io/ipfs/`+result[0].hash);
      if(error) {
        console.error(error);
        return
      }

    })

  }

  

verifyImage = async(upHash)=>{
  this.setState({fakeImage:upHash});  
  console.log(upHash);

  this.setState({loading:true});
  //  var resp = await deepai.callStandardApi("image-similarity", {
    //        image1: upHash,
      //      image2: "https://ipfs.infura.io/ipfs/QmcsuhM6gxAbBMcFgGu1PTjwxwrueoZotEHDM9yKkv76pe",
    //});
    //console.log(resp.output.distance);
    
    console.log(this.state.imgURLS);
    var imgURLS=this.state.imgURLS;
    var dist=[]
    for(let i=0;i<imgURLS.length;i++)
    {
      var resp = await deepai.callStandardApi("image-similarity", {
        image1: upHash,
        image2: imgURLS[i],
        });
      dist.push(resp.output.distance);
    }
    this.setState({originalImage:imgURLS[dist.indexOf(Math.min(...dist))],loading:false})
    

    console.log(dist);
    console.log(dist.indexOf(Math.min(...dist))+this.state.fakeImage);  
}




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
                </a>
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

        <div >
          
          <table width="70%">
            <tr>
              <th><h1>Uploaded Image</h1></th>
              <th><h2>Original Image</h2></th>
            </tr>

            <tr>
              <td><img alt="" src={this.state.fakeImage} /></td>
              <td>
                  {<Loader visible={this.state.loading} type="Rings"  />}
                  <img alt="" src={this.state.originalImage} />
              </td>
            </tr>
          
          </table>
          
        </div>
      </div>
    );  
}
}
export default Ver;
