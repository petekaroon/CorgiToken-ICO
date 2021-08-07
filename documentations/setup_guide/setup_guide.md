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

3. Deploy to local test network - at root folder, in a new terminal run command:
```
npx hardhat run scripts/deploy.js --network localhost
```

4. Deploy frontend - At `./frontend/ folder, run command:
```
npm install
```

then run command:
```
npm start
```

5. Connect MetaMask to the correct network, usually to PORT 8545 and Chain ID 31337

6. Import accounts from Hardhat test network to MetaMask.


## Ropsten Test Network Setup