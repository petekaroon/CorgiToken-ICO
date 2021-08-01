// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import 'hardhat/console.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract CorgiToken is ERC20 {
  address payable public founder;
  uint public initialSupply;

  constructor() ERC20('CorgiToken', 'CORGI') {
    founder = payable(msg.sender);
    initialSupply = 10000;
    _mint(founder, initialSupply);
  }
}


contract CorgiTokenICO is CorgiToken {
  address public admin;
  address payable public depositAddr;
  uint public tokenPrice = 0.01 ether; // 1 ETH = 100 CORGI, 1 CORGI = 0.01
  uint public hardCap = 60 ether;
  uint public raisedAmount; // value in wei
  uint public saleStart = block.timestamp;
  uint public saleEnd = block.timestamp + 604800; // one week

  uint public maxInvestment = 3 ether;
  uint public minInvestment = 0.1 ether;

  enum State { beforeStart, running, afterEnd, halted } // ICO states
  State public icoState;

  constructor(address payable _depositAddr) {
    depositAddr = _depositAddr;
    admin = msg.sender;
    icoState = State.beforeStart;
  }

  modifier onlyAdmin() {
    require(msg.sender == admin, 'You are not the admin');
    _;
  }

  // Emergency Stop
  function halt() public onlyAdmin {
    icoState = State.halted;
  }

  // Resume ICO
  function resume() public onlyAdmin {
    icoState = State.running;
  }

  function changeDepositAddress(address payable newDepositAddr) public onlyAdmin {
    depositAddr = newDepositAddr;
  }

  function _getCurrentState() private view returns (State) {
    if (icoState == State.halted) {
      return State.halted;

    } else if (block.timestamp < saleStart) {
      return State.beforeStart;

    } else if (block.timestamp > saleEnd) {
      return State.afterEnd;

    } else {
      return State.running;
    }
  }

  event Invest(address investor, uint value, uint tokens);

  // Function called when sending eth to the contract
  function invest() payable public returns (bool) {
    icoState = _getCurrentState();
    require(icoState == State.running);
    require(msg.value >= minInvestment && msg.value <= maxInvestment, 'Please invest a valid amount');

    raisedAmount += msg.value;
    require(raisedAmount <= hardCap);

    uint tokens = msg.value / tokenPrice;

    // Adding tokens to the investor's balance from the founder balance
    _transfer(founder, msg.sender, tokens);
    depositAddr.transfer(msg.value);

    emit Invest(msg.sender, msg.value, tokens);

    return true;
  }

  receive() payable external {
    invest();
  }
}