pragma solidity ^0.5.0;


contract Meme {

  string memeHash;


 function set(string memory _memeHash) public {
    memeHash = _memeHash;
    emit HashCreated(msg.sender,_memeHash);
  }

  function get() public view returns (string memory) {
    return memeHash;
  }

   event HashCreated(address indexed sender,string hash);
}
