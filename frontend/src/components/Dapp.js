import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import 'bulma/css/bulma.min.css';

import CorgiTokenICOArtifact from '../contracts/CorgiTokenICO.json';
import contractAddress from "../contracts/contract-address.json";

function Dapp() {
  const [admin, setAdmin] = useState(); 
  const [icoState, setIcoState] = useState(); 
  const [contractAddr, setContactAddr] = useState();
  const [tokenData, setTokenData] = useState({}); // Token name, symbol, price
  const [userAddr, setUserdAddr] = useState(); 
  const [userBalance, setUserBalance] = useState();
  const [depositAddr, setDepositAddr] = useState();
  const [icoData, setIcoData] = useState({}); // Sale start, sale end, hardCap, max min investment
  const [raisedAmount, setRaisedAmount] = useState();
  const [newDepositAcc, setNewDepositAcc] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [txTransferBeingSent, setTxTransferBeingSent] = useState();
  const [txSubmitBeingSent, setTxSubmitBeingSent] = useState();
  const [txHaltBeingSent, setTxHaltBeingSent] = useState();
  const [txResumeBeingSent, setTxResumeBeingSent] = useState();

  useEffect(() => {
    loadPageContent();

    // Listen to Metamask account change and update page accordingly
    window.ethereum.on('accountsChanged', () => {
      stopPollingData();
      loadPageContent();
    });

    return stopPollingData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let pollDataInterval;
  let currentUserAddr;
  let icoContract;
  const icoStatesArray = [
    'Not Started', 
    'Live',
    'Ended',
    'Halted'
  ];


  async function loadPageContent() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      await initializeEthers();
      await getAdmin();
      await getIcoState();
      await getContractAddress();
      await getTokenData();
      await getBalance();
      await getDepositAddress();
      await getIcoData();
      await getRaisedAmount();
      await startPollingData();
    }
  }

  // request access to the user's MetaMask account
  async function requestAccount() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    currentUserAddr = accounts[0];
    setUserdAddr(currentUserAddr.toLowerCase());
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
    const adminAddress = await icoContract.admin();
    setAdmin(adminAddress.toLowerCase());
  }

  async function getIcoState() {
    const state = await icoContract.icoState();
    setIcoState(icoStatesArray[state]);
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
    setDepositAddr(address.toLowerCase());
  }

  async function getIcoData() {
    let saleStart = await icoContract.saleStart();
    saleStart = convertToDate(saleStart).slice(0, 33);

    let saleEnd = await icoContract.saleEnd();
    saleEnd = convertToDate(saleEnd).slice(0, 33);

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

  async function handleSubmitNewDepositAddr(event) {
    event.preventDefault();
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      await initializeEthers();

      try {
        const tx = await icoContract.changeDepositAddress(newDepositAcc);
        setTxSubmitBeingSent(tx.hash);
        
        const receipt = await tx.wait();

        if (receipt.status === 0) {
          throw new Error('Transaction failed.');
        }

        setDepositAddr(newDepositAcc);
        setNewDepositAcc('')

      } catch (error) {
        console.log(error);
        error.code === 'INVALID_ARGUMENT' ?  alert('Invalid Address') : alert(error);

      } finally {
        setTxSubmitBeingSent(undefined);
      } 
    }
  }

  function handleChangeDepositAddr(event) {
    setNewDepositAcc(event.target.value);
  }

  async function handleSubmitTransfer(event) {
    event.preventDefault();
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      await initializeEthers();
      
      try {
        const tx = await icoContract.transfer(transferRecipient, transferAmount);
        setTxTransferBeingSent(tx.hash);
        
        const receipt = await tx.wait();

        if (receipt.status === 0) {
          throw new Error('Transaction failed.');
        }

        await getBalance();

        setTransferRecipient('');
        setTransferAmount('');

      } catch (error) {
        console.log(error);
        error.data.message ? alert(error.data.message) : alert(error);

      } finally {
        setTxTransferBeingSent(undefined);
      }
    }
  }

  function handleChangeTransferRecipient(event) {
    setTransferRecipient(event.target.value);
  }

  function handleChangeTransferAmount(event) {
    setTransferAmount(event.target.value);
  }

  async function handleHaltIco(event) {
    event.preventDefault();
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      await initializeEthers();

      try {
        const tx = await icoContract.halt();
        setTxHaltBeingSent(tx.hash);
        
        const receipt = await tx.wait();

        if (receipt.status === 0) {
          throw new Error('Transaction failed.');
        }

        const state = await icoContract.icoState();
        setIcoState(icoStatesArray[state]);

      } catch (error) {
        console.log(error);

      } finally {
        setTxHaltBeingSent(undefined);
      }
    }
  }

  async function handleResumeIco(event) {
    event.preventDefault();
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      await initializeEthers();
      
      try {
        const tx = await icoContract.resume();
        setTxResumeBeingSent(tx.hash);
        
        const receipt = await tx.wait();

        if (receipt.status === 0) {
          throw new Error('Transaction failed.');
        }

        const state = await icoContract.icoState();
        setIcoState(icoStatesArray[state]);

      } catch (error) {
        console.log(error);

      } finally {
        setTxResumeBeingSent(undefined);
      }

    }
  }


  function startPollingData() {
    pollDataInterval = setInterval(() => updateData(), 1000);
  }

  function stopPollingData() {
    clearInterval(pollDataInterval);
    pollDataInterval = undefined;
  }

  function updateData() {
    getBalance();
    getRaisedAmount();
    getIcoState();
  }

  return (
    <>
      <div className="columns">
        <div className="column">
          <section className="hero is-info is-small">
            <div className="hero-body">
              <h1 className="title">
                Corgi Token ICO
              </h1>
            </div>
          </section>
        </div>
      </div>

      <section className="info-tiles mx-4">
        <div className="tile is-ancestor has-text-centered">
          <div className="tile is-parent is-3">
          <article className="tile is-child box">
            <p className="subtitle">ICO Status</p>
            {icoState === 'Live' && 
              <span className="tag is-success is-medium">
                <b>{icoState}</b>
              </span>}
            {icoState !== 'Live' && 
              <span className="tag is-danger is-medium">
                <b>{icoState}</b>
              </span>}
          </article>
        </div>
      
      <div className="tile is-parent is-3">
          <article className="tile is-child box">
            <p className="subtitle">Total Funded</p>
            <span className="tag is-warning is-medium">
              <b>{raisedAmount} ETH</b>
            </span>
          </article>
        </div>
        
        <div className="tile is-parent is-6">
          <article className="tile is-child box">
            <p className="subtitle">To fund the project, transfer ETH to</p>
            <span className="tag is-link is-medium">
              <b>{contractAddr}</b>
            </span>
          </article>
          </div>
        </div>
      </section>

      <div className="columns mx-2">
        <div className="column is-6">
          <div className="card">
            <header className="card-header has-background-primary-light">
              <p className="card-header-title">ICO Information</p>
            </header>
            <div className="card-table">
              <div className="content">
                <table className="table is-striped is-bordered">
                  <tbody>
                    <tr>
                      <td width="35%">Token Name :</td>
                      <td>{tokenData.name}</td>
                    </tr>
                    <tr>
                      <td width="35%">Token symbol :</td>
                      <td>{tokenData.symbol}</td>
                    </tr>
                    <tr>
                      <td width="35%">Token Price :</td>
                      <td>{tokenData.price} ETH</td>
                    </tr>
                    <tr>
                      <td width="35%">ICO Hard Cap :</td>
                      <td>{icoData.hardCap} ETH</td>
                    </tr>
                    <tr>
                      <td width="35%">Min. Investment :</td>
                      <td>{icoData.minInvestment} ETH</td>
                    </tr>
                    <tr>
                      <td width="35%">Max. Investment :</td>
                      <td>{icoData.maxInvestment} ETH</td>
                    </tr>
                    <tr>
                      <td width="35%">ICO Start :</td>
                      <td>{icoData.saleStart}</td>
                    </tr>
                    <tr>
                      <td width="35%">ICO End :</td>
                      <td>{icoData.saleEnd}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="column is-6">
          <div className="card">
            <header className="card-header has-background-primary-light">
              <p className="card-header-title">User Account</p>
            </header>
            <div className="card-table">
              <div className="content">
                <table className="table is-fullwidth is-striped is-bordered">
                  <tbody>
                    <tr>
                      <td width="30%">Address :</td>
                      <td>{userAddr}</td>
                    </tr>
                    <tr>
                      <td width="30%">Balance :</td>
                      <td>{userBalance} CORGI</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <header className="card-header has-background-primary-light">
                <p className="card-header-title">Transfer Corgi Token</p>
              </header>
              <div className="card-form">
                <div className="content mx-4 py-4">
                  <form onSubmit={handleSubmitTransfer}>
                    <div className="field">
                      <label className="label">Recipient</label>
                      <div className="control">
                        <input className="input" type="text" onChange={handleChangeTransferRecipient} value={transferRecipient} placeholder="Recipient Address"/>
                      </div>
                    </div>
                    <div className="field">
                      <label className="label">Amount</label>
                      <div className="control">
                        <input className="input" type="number" onChange={handleChangeTransferAmount} value={transferAmount} placeholder="Amount in CORGI"/>
                      </div>
                    </div>
                    <div className="control">
                      {!txTransferBeingSent && <input className="button is-info" type="submit" value="Transfer"></input>}
                      {txTransferBeingSent && <input className="button is-info" type="submit" value="Processing..." disabled></input>}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div> 
      </div>

      {(userAddr === admin) && (
        <div className="column">
          <div className="card">
            <header className="card-header has-background-primary-light">
              <p className="card-header-title">Admin Only Section</p>
            </header>

            <div className="card-table">
              <div className="content">
                <table className="table is-fullwidth is-striped is-bordered">
                  <tbody>
                    <tr>
                      <td width="20%">Admin :</td>
                      <td>{admin}</td>
                    </tr>
                    <tr>
                      <td width="20%">Deposit Account :</td>
                      <td>{depositAddr}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card-form">
              <div className="content mx-4 py-4">
                <form onSubmit={handleSubmitNewDepositAddr}>
                  <label className="label">Change Deposit Account</label>
                  <div className="field is-grouped">
                    <div className="control is-expanded">
                      <input className="input" type="text" onChange={handleChangeDepositAddr} value={newDepositAcc} placeholder="New Deposit Address"/>
                    </div>
                  </div>
                  <div className="control">
                      {!txSubmitBeingSent && <input className="button is-info" type="submit" value="Submit"></input>}
                      {txSubmitBeingSent && <input className="button is-info" type="submit" value="Processing..." disabled></input>}
                  </div>
                </form>
              </div>
            </div>

            <div className="card-form">
              <div className="content mx-4 pb-4">
                <label className="label">Change ICO Status</label>
                {!txHaltBeingSent && <button className="button is-danger mr-4" onClick={handleHaltIco}>Halt ICO</button>}
                {txHaltBeingSent && <button className="button is-danger mr-4" disabled onClick={handleHaltIco}>Processing...</button>}
                
                {!txResumeBeingSent && <button className="button is-success" onClick={handleResumeIco}>Resume ICO</button>}
                {txResumeBeingSent && <button className="button is-success" disabled onClick={handleResumeIco}>Processing...</button>}
              </div>
            </div>

          </div>
        </div> 
      )}
    </>
  )
}


export default Dapp;