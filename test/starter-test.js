/* eslint-disable prettier/prettier */
const hre = require('hardhat');
const chai = require('chai');
const {solidity} = require('ethereum-waffle');
chai.use(solidity);
const {expect} = chai;

const moveTimeForward = async (seconds) => {
  await network.provider.send('evm_increaseTime', [seconds]);
  await network.provider.send('evm_mine');
};

// use with small values in case harvest is block-dependent instead of time-dependent
const moveBlocksForward = async (blocks) => {
  for (let i = 0; i < blocks; i++) {
    await network.provider.send('evm_increaseTime', [1]);
    await network.provider.send('evm_mine');
  }
};

const toWantUnit = (num, isUSDC = false) => {
  if (isUSDC) {
    return ethers.BigNumber.from(num * 10 ** 8);
  }
  return ethers.utils.parseEther(num);
};

describe('Vaults', function () {
  let Vault;
  let vault;

  let Strategy;
  let strategy;

  let Want;
  let want;
  let joinErc; // ETH
  let beets;
  let dai;
  let usdc;

  const treasuryAddr = '0x1E71AEE6081f62053123140aacC7a06021D77348';
  const paymentSplitterAddress = '0x1E71AEE6081f62053123140aacC7a06021D77348';
  const wantAddress = '0x39965c9dAb5448482Cf7e002F583c812Ceb53046';
  const gauge = '0x00a2bD63529fD28d777155F5eD1726e9b9b781B4';

  const wantHolderAddr = '0x1E71AEE6081f62053123140aacC7a06021D77348';
  const strategistAddr = '0x1E71AEE6081f62053123140aacC7a06021D77348';
  const defaultAdminAddress = '0x1E71AEE6081f62053123140aacC7a06021D77348';
  const adminAddress = '0x1E71AEE6081f62053123140aacC7a06021D77348';
  const guardianAddress = '0x1E71AEE6081f62053123140aacC7a06021D77348';

  // const beetsAddress = '';
  // const beetsHolderAddr = '';

  // const daiAddress = '';
  const usdcAddress = '0x7F5c764cBc14f9669B88837ca1490cCa17c31607';
  const joinErcAddress = '0x4200000000000000000000000000000000000006'; // ETH
  const rewardUsdcPool = '0x7ef99013e446ddce2486b8e04735b7019a115e6f000100000000000000000005';
  const rewardJoinErcPool = '0xd6e5824b54f64ce6f1161210bc17eebffc77e031000100000000000000000006';
  // const deusAddress = '';

  let owner;
  let wantHolder;
  let strategist;
  let beetsHolder;

  beforeEach(async function () {
    //reset network
    await network.provider.request({
      method: 'hardhat_reset',
      params: [
        {
          forking: {
            jsonRpcUrl: 'https://mainnet.optimism.io',
            // blockNumber: 37848216,
          },
        },
      ],
    });

    //get signers
    [owner] = await ethers.getSigners();
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [wantHolderAddr],
    });
    wantHolder = await ethers.provider.getSigner(wantHolderAddr);
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [strategistAddr],
    });
    strategist = await ethers.provider.getSigner(strategistAddr);
    // await hre.network.provider.request({
    //   method: 'hardhat_impersonateAccount',
    //   params: [beetsHolderAddr],
    // });
    // beetsHolder = await ethers.provider.getSigner(beetsHolderAddr);

    // get artifacts
    Vault = await ethers.getContractFactory('ReaperVaultv1_4');
    Strategy = await ethers.getContractFactory('ReaperStrategyHappyRoad');
    Want = await ethers.getContractFactory('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20');

    // deploy contracts
    vault = await Vault.deploy(
      wantAddress,
      'Happy Road Beethoven-X Crypt',
      'rfBPT-ROAD',
      0,
      ethers.constants.MaxUint256,
    );
    strategy = await hre.upgrades.deployProxy(
      Strategy,
      [
        vault.address,
        [treasuryAddr, paymentSplitterAddress],
        [strategistAddr],
        [defaultAdminAddress, adminAddress, guardianAddress],
        wantAddress,
        usdcAddress,
        gauge,
        rewardUsdcPool,
        rewardUsdcPool
      ],
      {kind: 'uups'},
    );
    await strategy.deployed();
    await vault.initialize(strategy.address);

    await strategy.pause();
    // await strategy.addSwapStep(deusAddress, daiAddress, 1 /* total fee */, 0);
    // await strategy.addChargeFeesStep(daiAddress, 0 /* absolute */, 10_000);
    await strategy.unpause();

    want = await Want.attach(wantAddress);
    usdc = await Want.attach(usdcAddress);
    // dai = await Want.attach(daiAddress);
    joinErc = await Want.attach(joinErcAddress);

    //approving LP token and vault share spend
    await want.connect(wantHolder).approve(vault.address, ethers.constants.MaxUint256);
  });

  describe('Deploying the vault and strategy', function () {
    it('should initiate vault with a 0 balance', async function () {
      const totalBalance = await vault.balance();
      const availableBalance = await vault.available();
      const pricePerFullShare = await vault.getPricePerFullShare();
      expect(totalBalance).to.equal(0);
      expect(availableBalance).to.equal(0);
      expect(pricePerFullShare).to.equal(ethers.utils.parseEther('1'));
    });

    // Upgrade tests are ok to skip IFF no changes to BaseStrategy are made
    xit('should not allow implementation upgrades without initiating cooldown', async function () {
      const StrategyV2 = await ethers.getContractFactory('TestReaperStrategyTombMaiV2');
      await expect(hre.upgrades.upgradeProxy(strategy.address, StrategyV2)).to.be.revertedWith(
        'cooldown not initiated or still active',
      );
    });

    xit('should not allow implementation upgrades before timelock has passed', async function () {
      await strategy.initiateUpgradeCooldown();

      const StrategyV2 = await ethers.getContractFactory('TestReaperStrategyTombMaiV3');
      await expect(hre.upgrades.upgradeProxy(strategy.address, StrategyV2)).to.be.revertedWith(
        'cooldown not initiated or still active',
      );
    });

    it('should allow implementation upgrades once timelock has passed', async function () {
      const StrategyV2 = await ethers.getContractFactory('ReaperStrategyHappyRoad2');
      const timeToSkip = (await strategy.UPGRADE_TIMELOCK()).add(10);
      await strategy.initiateUpgradeCooldown();
      await moveTimeForward(timeToSkip.toNumber());
      await hre.upgrades.upgradeProxy(strategy.address, StrategyV2);
    });

    xit('successive upgrades need to initiate timelock again', async function () {
      const StrategyV2 = await ethers.getContractFactory('TestReaperStrategyTombMaiV2');
      const timeToSkip = (await strategy.UPGRADE_TIMELOCK()).add(10);
      await strategy.initiateUpgradeCooldown();
      await moveTimeForward(timeToSkip.toNumber());
      await hre.upgrades.upgradeProxy(strategy.address, StrategyV2);

      const StrategyV3 = await ethers.getContractFactory('TestReaperStrategyTombMaiV3');
      await expect(hre.upgrades.upgradeProxy(strategy.address, StrategyV3)).to.be.revertedWith(
        'cooldown not initiated or still active',
      );

      await strategy.initiateUpgradeCooldown();
      await expect(hre.upgrades.upgradeProxy(strategy.address, StrategyV3)).to.be.revertedWith(
        'cooldown not initiated or still active',
      );

      await moveTimeForward(timeToSkip.toNumber());
      await hre.upgrades.upgradeProxy(strategy.address, StrategyV3);
    });
  });

  xdescribe('Vault Tests', function () {
    xit('should allow deposits and account for them correctly', async function () {
      const userBalance = await want.balanceOf(wantHolderAddr);
      const vaultBalance = await vault.balance();
      const depositAmount = toWantUnit('10');
      await vault.connect(wantHolder).deposit(depositAmount);

      const newVaultBalance = await vault.balance();
      const newUserBalance = await want.balanceOf(wantHolderAddr);
      const allowedInaccuracy = depositAmount.div(200);
      expect(depositAmount).to.be.closeTo(newVaultBalance, allowedInaccuracy);
    });

    xit('should mint user their pool share', async function () {
      const userBalance = await want.balanceOf(wantHolderAddr);
      const depositAmount = toWantUnit('1');
      await vault.connect(wantHolder).deposit(depositAmount);

      const ownerDepositAmount = toWantUnit('0.1');
      await want.connect(wantHolder).transfer(owner.address, ownerDepositAmount);
      await want.connect(owner).approve(vault.address, ethers.constants.MaxUint256);
      await vault.connect(owner).deposit(ownerDepositAmount);

      const allowedImprecision = toWantUnit('0.0001');

      const userVaultBalance = await vault.balanceOf(wantHolderAddr);
      expect(userVaultBalance).to.be.closeTo(depositAmount, allowedImprecision);
      const ownerVaultBalance = await vault.balanceOf(owner.address);
      expect(ownerVaultBalance).to.be.closeTo(ownerDepositAmount, allowedImprecision);

      await vault.connect(owner).withdrawAll();
      const ownerWantBalance = await want.balanceOf(owner.address);
      expect(ownerWantBalance).to.be.closeTo(ownerDepositAmount, allowedImprecision);
      const afterOwnerVaultBalance = await vault.balanceOf(owner.address);
      expect(afterOwnerVaultBalance).to.equal(0);
    });

    xit('should allow withdrawals', async function () {
      const userBalance = await want.balanceOf(wantHolderAddr);
      const depositAmount = toWantUnit('10');
      await vault.connect(wantHolder).deposit(depositAmount);

      await vault.connect(wantHolder).withdrawAll();
      const newUserVaultBalance = await vault.balanceOf(wantHolderAddr);
      const userBalanceAfterWithdraw = await want.balanceOf(wantHolderAddr);

      const securityFee = 10;
      const percentDivisor = 10000;
      const withdrawFee = depositAmount.mul(securityFee).div(percentDivisor);
      const expectedBalance = userBalance.sub(withdrawFee);
      const smallDifference = expectedBalance.div(200);
      const isSmallBalanceDifference = expectedBalance.sub(userBalanceAfterWithdraw) < smallDifference;
      expect(isSmallBalanceDifference).to.equal(true);
    });

    xit('should allow small withdrawal', async function () {
      const userBalance = await want.balanceOf(wantHolderAddr);
      const depositAmount = toWantUnit('0.0000001');
      await vault.connect(wantHolder).deposit(depositAmount);

      const ownerDepositAmount = toWantUnit('0.1');
      await want.connect(wantHolder).transfer(owner.address, ownerDepositAmount);
      await want.connect(owner).approve(vault.address, ethers.constants.MaxUint256);
      await vault.connect(owner).deposit(ownerDepositAmount);

      await vault.connect(wantHolder).withdrawAll();
      const newUserVaultBalance = await vault.balanceOf(wantHolderAddr);
      const userBalanceAfterWithdraw = await want.balanceOf(wantHolderAddr);

      const securityFee = 10;
      const percentDivisor = 10000;
      const withdrawFee = depositAmount.mul(securityFee).div(percentDivisor);
      const expectedBalance = userBalance.sub(withdrawFee);
      const smallDifference = expectedBalance.div(200);
      const isSmallBalanceDifference = expectedBalance.sub(userBalanceAfterWithdraw) < smallDifference;
      expect(isSmallBalanceDifference).to.equal(true);
    });

    xit('should handle small deposit + withdraw', async function () {
      const userBalance = await want.balanceOf(wantHolderAddr);
      const depositAmount = toWantUnit('0.0000000000001');
      await vault.connect(wantHolder).deposit(depositAmount);

      await vault.connect(wantHolder).withdraw(depositAmount);
      const newUserVaultBalance = await vault.balanceOf(wantHolderAddr);
      const userBalanceAfterWithdraw = await want.balanceOf(wantHolderAddr);

      const securityFee = 10;
      const percentDivisor = 10000;
      const withdrawFee = (depositAmount * securityFee) / percentDivisor;
      const expectedBalance = userBalance.sub(withdrawFee);
      const isSmallBalanceDifference = expectedBalance.sub(userBalanceAfterWithdraw) < 200;
      expect(isSmallBalanceDifference).to.equal(true);
    });

    it('should be able to harvest', async function () {
      await vault.connect(wantHolder).deposit(toWantUnit('10'));
      // await moveBlocksForward(100);
      await moveTimeForward(3600 * 24);
      const readOnlyStrat = await strategy.connect(ethers.provider);
      const predictedCallerFee = await readOnlyStrat.callStatic.harvest();
      console.log(`predicted caller fee ${ethers.utils.formatEther(predictedCallerFee)}`);

      const usdcBalBefore = await usdc.balanceOf(owner.address);
      const tx = await strategy.harvest();
      const receipt = await tx.wait();
      console.log(`gas used ${receipt.gasUsed}`);
      const usdcBalAfter = await usdc.balanceOf(owner.address);
      const usdcBalDifference = usdcBalAfter.sub(usdcBalBefore);
      console.log(`actual caller fee ${ethers.utils.formatEther(usdcBalDifference)}`);
    });

    it('should provide yield', async function () {
      const timeToSkip = 3600;
      await vault.connect(wantHolder).deposit(toWantUnit('10'));
      const initialVaultBalance = await vault.balance();

      await strategy.updateHarvestLogCadence(1);

      const numHarvests = 5;
      // beets = Want.attach(beetsAddress);
      for (let i = 0; i < numHarvests; i++) {
        // await beets.connect(beetsHolder).transfer(strategy.address, toWantUnit('1'));
      await moveTimeForward(3600 * 24);
        await strategy.harvest();
      }

      const finalVaultBalance = await vault.balance();
      expect(finalVaultBalance).to.be.gt(initialVaultBalance);

      const averageAPR = await strategy.averageAPRAcrossLastNHarvests(numHarvests);
      console.log(`Average APR across ${numHarvests} harvests is ${averageAPR} basis points.`);
    });
  });
  xdescribe('Strategy', function () {
    it('should be able to pause and unpause', async function () {
      await strategy.pause();
      const depositAmount = toWantUnit('1');
      await expect(vault.connect(wantHolder).deposit(depositAmount)).to.be.reverted;

      await strategy.unpause();
      await expect(vault.connect(wantHolder).deposit(depositAmount)).to.not.be.reverted;
    });

    it('should be able to panic', async function () {
      const depositAmount = toWantUnit('0.0007');
      await vault.connect(wantHolder).deposit(depositAmount);
      const vaultBalance = await vault.balance();
      const strategyBalance = await strategy.balanceOf();
      await strategy.panic();

      const wantStratBalance = await want.balanceOf(strategy.address);
      const allowedImprecision = toWantUnit('0.000000001');
      expect(strategyBalance).to.be.closeTo(wantStratBalance, allowedImprecision);
    });
  });
});
