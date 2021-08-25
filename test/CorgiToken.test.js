const { expect, use } = require('Chai');
const { solidity } = require('ethereum-waffle');

use(solidity);

describe('Token Contract Deployment', () => {
  it('Deployment should assign all initial token supply to the founder', async () => {
    const [founder] = await ethers.getSigners();
    const CorgiToken = await ethers.getContractFactory('CorgiToken');
    const corgiToken = await CorgiToken.deploy();

    const founderBalance = await corgiToken.balanceOf(founder.address);
    expect((await corgiToken.totalSupply()).toString()).to.equal(founderBalance.toString());
    expect(founderBalance.toString()).to.equal('50000');
  });
});

describe('ICO Contract', () => {
  let CorgiTokenICO;
  let corgiTokenICO;
  let admin;
  let user1;
  let user2;
  let depositAcc;

  beforeEach(async () => {
    [admin, user1, user2, depositAcc] = await ethers.getSigners();
    CorgiTokenICO = await ethers.getContractFactory('CorgiTokenICO');
    corgiTokenICO = await CorgiTokenICO.deploy(depositAcc.address);
  });

  describe('Deployment', () => {
    it('Should assign a valid address of deposit account', async () => {
      const depositAddress = await corgiTokenICO.depositAddr();
      expect(depositAddress).to.equal(depositAcc.address);
    });

    it('Should set the right admin', async () => {
      const _admin = await corgiTokenICO.admin();
      expect(admin.address).to.equal(_admin);
    });
  });

  describe('Change address of deposit account', () => {
    it('Should change the address of deposit account', async () => {
      await corgiTokenICO.changeDepositAddress('0x9eb71d1e60c6d84A5C7570DF44A83bA4F5Cd6Fc4');
      const newDepositAddress = await corgiTokenICO.depositAddr();
      expect(newDepositAddress).to.equal('0x9eb71d1e60c6d84A5C7570DF44A83bA4F5Cd6Fc4');
    });
  });

  describe('Non-admin actions', () => {
    it('Should fail if non-admin tries to change deposit address', async () => {
      await expect(
        corgiTokenICO.connect(user1).changeDepositAddress('0x9eb71d1e60c6d84A5C7570DF44A83bA4F5Cd6Fc4')
      ).to.be.revertedWith('You are not the admin');
    });
  });

  describe('Investor transfer ETH to contract', () => {
    it('Should credit investor with 200 tokens, and credit 2ETH to founder', async () => {
      let depositAccETHBalance = await ethers.provider.getBalance(depositAcc.address);
      depositAccETHBalance = ethers.BigNumber.from(depositAccETHBalance.toString());

      await user1.sendTransaction({
        to: corgiTokenICO.address,
        value: ethers.utils.parseEther('2.0'), // Sends 2 ether
      });

      const tokenBalance = await corgiTokenICO.balanceOf(user1.address);
      expect(tokenBalance).to.equal(200);

      let newDepositAccETHBalance = await ethers.provider.getBalance(depositAcc.address);
      newDepositAccETHBalance = ethers.BigNumber.from(newDepositAccETHBalance.toString());

      const diffInDepositAccETHBalance = ethers.utils.formatEther(newDepositAccETHBalance.sub(depositAccETHBalance));
      expect(diffInDepositAccETHBalance).to.equal('2.0');
    });
  });

  describe('Emit invest event', () => {
    it('Should emit invest event', async () => {
      await expect(user1.sendTransaction({
        to: corgiTokenICO.address,
        value: ethers.utils.parseEther('2.0'), // Sends 2 ether
      }))
        .to.emit(corgiTokenICO, 'Invest')
        .withArgs(user1.address, ethers.utils.parseEther('2.0'), 200);
    })
  })

  describe('Investor transfer more than maxInvestment to contract', () => {
    it('Should revert with - Please invest a valid amount', async () => {
      await expect(user1.sendTransaction({
        to: corgiTokenICO.address,
        value: ethers.utils.parseEther('25.0'), // Sends 25 ether
      })).to.be.revertedWith('Please invest a valid amount');
    });
  });

  describe('User1 transfer 50 CORGI to User2', () => {
    it('Should make user1 balance 150 CORGI, user2 balance 50 CORGI', async () => {
      await user1.sendTransaction({
        to: corgiTokenICO.address,
        value: ethers.utils.parseEther('2.0'), // Sends 2 ether
      });

      await corgiTokenICO.connect(user1).transfer(user2.address, 50);
      const user1Balance = await corgiTokenICO.balanceOf(user1.address);
      const user2Balance = await corgiTokenICO.balanceOf(user2.address);

      expect(user1Balance).to.equal(150);
      expect(user2Balance).to.equal(50);
    });
  });
});