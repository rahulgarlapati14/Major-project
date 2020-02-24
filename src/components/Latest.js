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
//      const memeHash = await contract.methods.get().call()
  //    this.setState({ memeHash })
      this.setState({ethAddress:networkData.address})
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  constructor(props){
    super(props);
  
    this.state = {
        memeHash: '',
        contract: null,
        web3: null,
        buffer: null,
        account: null,
        ethAddress:'',
        blockNumber:'',
        transactionHash:'',
        gasUsed:'',
        txReceipt: '',
        stored:[],
      }
     
    } 
  
  
  res= async(args)=>{
    //console.log(args)
    let re=[]
    for(let i=0;i<args.length;i++){
      console.log(args[i].returnValues[1])
      re.push(args[i].returnValues[1])
    }
    this.setState({stored:re})
    console.log(re)
    
  }
  retrieve= async () =>{

   /* const n=10;
    const web3 = window.web3
    const latest = await web3.eth.getBlockNumber()
    const blockNumbers =[];
    for(let i=latest-n;i<latest+1;i++){
        blockNumbers.push(i);
        console.log(JSON.stringify(i));
        
        var transaction=web3.eth.getTransactionFromBlock(i,0)
        console.log(transaction)
      //_range(latest - n, latest + 1, 1 
  }*/
  let t=this;
  this.state.contract.getPastEvents('HashCreated', {
    fromBlock: 0,
    toBlock: 'latest'
},function(error, events){ 
    t.res(events);
  //console.log(events); 
  
  
  })
 
 
}

  render() {
   
    
    const images = this.state.stored.map(
      (image, index) => <img src={`https://ipfs.infura.io/ipfs/`+image} key={index} alt="" />
    )
    

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

        
        <div id="latestimg">

            <center> 
            <h2>Latest Images in Blockchain</h2>
            <button onClick={this.retrieve}>Click me</button>
            <section>
            {images}
            </section>
          
            </center>
          
            
        </div> 
        
        
    </div>
    );  
}
}
export default Latest;
