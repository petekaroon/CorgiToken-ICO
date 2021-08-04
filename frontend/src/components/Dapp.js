/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import CorgiTokenICOArtifact from '../contracts/CorgiTokenICO.json';
import contractAddress from "../contracts/contract-address.json";

function Dapp() {
  const [contractAddr, setContactAddr] = useState();
  const [tokenData, setTokenData] = useState({}); // Token name, symbol, price
  const [userAddr, setUserdAddr] = useState(); 
  const [userBalance, setUserBalance] = useState();
  const [depositAddr, setDepositAddr] = useState();
  const [icoData, setIcoData] = useState({}); // Sale start, sale end, hardCap, max min investment
  const [raisedAmount, setRaisedAmount] = useState();
  const [newDepositAcc, setNewDepositAcc] = useState('');
  // const [txBeingSent, setTxBeing] = useState();
  // const [txError, setTxError] = useState();
  // const [pollDataInterval, setPollDataInterval] = useState();

  useEffect(() => {
    loadPageContent();
  }, []);

  let admin;
  let currentUserAddr;
  let icoContract;

  async function loadPageContent() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      await initializeEthers();
      await getAdmin();
      await getContractAddress();
      await getTokenData();
      await getBalance();
      await getDepositAddress();
      await getIcoData();
      await getRaisedAmount();
    }
  }

  // request access to the user's MetaMask account
  async function requestAccount() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    currentUserAddr = accounts[0];
    setUserdAddr(currentUserAddr);
  }

  async function initializeEthers() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      contractAddress.CorgiTokenICO,
      CorgiTokenICOArtifact.abi,
      provider.getSigner(0)
    );
    icoContract = contract;
  }

  async function getAdmin() {
    admin = await icoContract.admin();
  }

  async function  getContractAddress() {
    setContactAddr(icoContract.address);
  }

  async function getTokenData() {
    const name = await icoContract.name();
    const symbol = await icoContract.symbol();
    
    let price = await icoContract.tokenPrice();
    price = ethers.utils.formatEther(price);
    
    setTokenData({ name, symbol, price });
  }

  async function getBalance() {
    const balance = await icoContract.balanceOf(currentUserAddr);
    setUserBalance(balance.toString());
  }

  async function getDepositAddress() {
    const address = await icoContract.depositAddr();
    setDepositAddr(address);
  }

  async function getIcoData() {
    let saleStart = await icoContract.saleStart();
    saleStart = convertToDate(saleStart);

    let saleEnd = await icoContract.saleEnd();
    saleEnd = convertToDate(saleEnd);

    let hardCap = await icoContract.hardCap();
    hardCap = ethers.utils.formatEther(hardCap);

    let minInvestment = await icoContract.minInvestment();
    minInvestment = ethers.utils.formatEther(minInvestment);

    let maxInvestment = await icoContract.maxInvestment();
    maxInvestment = ethers.utils.formatEther(maxInvestment);

    setIcoData({ saleStart, saleEnd, hardCap, minInvestment, maxInvestment });
  }

  function convertToDate(utcSeconds) {
    let date = new Date(0);
    date.setUTCSeconds(utcSeconds);
    return date.toString();
  }

  async function getRaisedAmount() {
    let amount = await icoContract.raisedAmount();
    setRaisedAmount(ethers.utils.formatEther(amount));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      await initializeEthers();
      await icoContract.changeDepositAddress(newDepositAcc);
      setDepositAddr(newDepositAcc);
      setNewDepositAcc('')
    }
  }

  function handleChange(event) {
    setNewDepositAcc(event.target.value);
  }

  return (
    <>
      <button onClick={loadPageContent}>Reload</button>
      <p>Contract Address: {contractAddr}</p>
      <p>User: {userAddr}</p>
      <p>Name: {tokenData.name}</p>
      <p>Symbol: {tokenData.symbol}</p>
      <p>Price: {tokenData.price} ETH</p>
      <p>Balance: {userBalance} CORGI</p>
      <p>Deposit address: {depositAddr}</p>
      <p>Sale Start: {icoData.saleStart}</p>
      <p>Sale Start: {icoData.saleEnd}</p>
      <p>Min Investment: {icoData.minInvestment} ETH</p>
      <p>Max Investment: {icoData.maxInvestment} ETH</p>
      <p>Hard Cap: {icoData.hardCap} ETH</p>
      <p>Raised Amount: {raisedAmount} ETH</p>

    {(currentUserAddr === admin) && (
      <form onSubmit={handleSubmit}>
        <input type="text" onChange={handleChange} value={newDepositAcc} />
        <input type="submit" value="Change Deposit Address"></input>
      </form>
    )}
    </>
  )
}


export default Dapp;