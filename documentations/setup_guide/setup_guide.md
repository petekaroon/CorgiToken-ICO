# Setup Guide

## Hardhat (Local Development) Setup

1. Install dependencies - at root folder, run command: 
```
npm install
```

2. Start Hardhat nodes - at root folder, run command:
```
npx hardhat node
```

3. Deploy to local test network - at root folder, in a new terminal, run command:
```
npx hardhat run scripts/deploy.js --network localhost
```

4. Deploy frontend - At `./frontend` folder, in a new terminal, run command:
```
npm install
```

then run command:
```
npm start
```

5. Connect MetaMask to the correct network, usually to PORT 8545 and Chain ID 31337

6. Import accounts from Hardhat test network to MetaMask.

7. You are ready to go!


## Ropsten Test Network Setup
1. Install dependencies - at root folder, run command: 
```
npm install
```

2. Change network configuration - at root folder, in `hardhat.config.js` file, change network from `hardhat` to `ropsten`:
```
module.exports = {
  solidity: "0.8.0",
  networks: {
  //   hardhat: {
  //     chainId: 31337,
  //   },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`0x${ROPSTEN_PRIVATE_KEY}`],
    },
  },
};
```

3. Create an account in [Alchemy](https://www.alchemy.com/), and obtain an API KEY

4. Create accounts on Ropsten test network, obtain ETH from [Ropsten Faucet](https://faucet.ropsten.be/), and obtain a PRIVATE KEY to be the smart contract deployer.

5. Setup `ALCHEMY_API_KEY` and `ROPSTEN_PRIVATE_KEY` - at root folder, create a .env file with the following information:
```
ALCHEMY_API_KEY=[add your key here]
ROPSTEN_PRIVATE_KEY=[add your key here]
```

6. Deploy to Ropsten test network - at root folder, in a new terminal, run command:
```
npx hardhat run scripts/deploy.js --network ropsten
```

7. Deploy frontend - At `./frontend` folder, in a new terminal, run command:
```
npm install
```

then run command:
```
npm start
```

8. Connect MetaMask to the correct network i.e. Ropsten

9. Import accounts from Ropsten test network to MetaMask.

10. You are ready to go!
