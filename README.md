# Fake Image Analysis Using Blockchain (Major Project)

## Project Setup
#### Part 1

- ##### Node.js
The first dependency required is **Node.js**, which will provide Node Package Manager (NMP).Use NPM to install other dependencies in this project.Check if Node is already installed or not by executing command from your terminal: <br />`$ node -v`
<br/>If not installed yet, you can download it directly from the [Node.js](https://nodejs.org/en/) website.

- ##### Ganache Blockchain
The next dependency is a development blockchain, which can be used to mimic the behavior of a production blockchain. We used Ganache as our development blockchain for this project. We can use it to deploy smart contracts into blockchain,check the block details and event details etc. Find the latest release for your operating system [here](https://www.trufflesuite.com/ganache).

- ##### Truffle Framework
The next dependency is the Truffle Framework, which gives us a suite of tools for developing blockchain applications. It will enable us to develop smart contracts, write tests against them, and deploy them to the ganache blockchain.
Install Truffle from the command line with NPM like this `$ npm install -g truffle@5.0.2` 

- ##### Metamask Ethereum Wallet
Install the Metamask Ethereum Wallet from this [link](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en) in order to turn our web browser into a blockchain browser. Your current web browser most likely doesn't support this natively, so we need the Metamask extension for Google Chrome in order to connect to the blockchain.

#### Part 2

- After installing all the above required softwares we need to first link Metamask and Ganache Blockchain.We can connect Metamask and Ganache with the help of [this link](https://steemit.com/ganache/@matbest/setting-up-ganache-and-metamask-on-my-windows-10-home-laptop).

- The next step is download the source code of this project using `$ git clone https://github.com/rahulgarlapati14/Major-project` or download the zip file.

- Enter into the cloned project folder
- Install all the packages required from package.json using the command `$npm install`
- Then compile and deploy the smart contract `Meme.sol` into ganache using command <br/>`$truffle compile ` <br/>`$truffle deploy `
- Then start the server by using command `$ npm start` and the application will be hosted on `localhost:3000`.

#### Application WorkFlow

- The main page is hosted on the server and gets displayed with three options uploading of image to blockchain, verification of image, display of stored images.

- After entering into upload images module user need to upload image into file picker.
- From that image IPFS hash is retrieved and checks for the image in blockchain.
- If image is already present in blockchain user will get alert and redirected to features page.
- If image is not present the image gets uploaded into ganache upon confirmation from metamask and returns transaction receipt details.
- After entering into the display images module users get display with all latest images that are stored in the blockchain with the help of events.
- After entering into image verification module, the uploaded image is checked with stored images.
- The original image is detected and displays the original image along with the similarity score.


