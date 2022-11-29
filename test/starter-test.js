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
  let dai;
  let usdc;

  const treasuryAddr = '0x1E71AEE6081f62053123140aacC7a06021D77348';
  const paymentSplitterAddress = '0x1E71AEE6081f62053123140aacC7a06021D77348';
  const wantAddress = '0x98dc12979A34EE2F7099B1cBD65f9080c5a3284F';
  const gauge = '0xDB8dD0d6f1E22A5608483778206577683a408bD0';

  const wantHolderAddr = '0x289a74cc1306387877fcc9bbcac0fed15825b473';
  const strategistAddr = '0x4C3490dF15edFa178333445ce568EC6D99b5d71c';
  const defaultAdminAddress = '0x1E71AEE6081f62053123140aacC7a06021D77348';
  const adminAddress = '0x1E71AEE6081f62053123140aacC7a06021D77348';
  const guardianAddress = '0x1E71AEE6081f62053123140aacC7a06021D77348';

  const etherWhaleAddress = '0xa3f45e619cE3AAe2Fa5f8244439a66B203b78bCc';

  // const beetsAddress = '';
  // const beetsHolderAddr = '';

  // const daiAddress = '';
  const usdcAddress = '0x7F5c764cBc14f9669B88837ca1490cCa17c31607';
  const veloAddress = '0x3c8B650257cFb5f272f799F5e2b4e65093a11a05';
  const usdplusAddress = '0x73cb180bf0521828d8849bc8CF2B920918e23032';
  const wstethAddress = '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb';

  let owner;
  let wantHolder;
  let strategist;
  let etherWhale;

  beforeEach(async function () {
    //reset network
    await network.provider.request({
      method: 'hardhat_reset',
      params: [
        {
          forking: {
            jsonRpcUrl: 'https://late-fragrant-rain.optimism.quiknode.pro/70171d2e7790f3af6a833f808abe5e85ed6bd881/',
             //blockNumber: 43335099,
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

    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [etherWhaleAddress],
    });
    etherWhale = await ethers.provider.getSigner(etherWhaleAddress);

    await etherWhale.sendTransaction({
      to: wantHolderAddr,
      value: ethers.utils.parseEther("10") // 1 ether
    })
    await etherWhale.sendTransaction({
      to: strategistAddr,
      value: ethers.utils.parseEther("10") // 1 ether
    })

    // get artifacts
    Vault = await ethers.getContractFactory('ReaperVaultv1_4');
    Strategy = await ethers.getContractFactory('ReaperStrategyVelodrome');
    Want = await ethers.getContractFactory('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20');

    // deploy contracts
    vault = await Vault.deploy(
      wantAddress,
      'Velodrome Crypt',
      'rfTest',
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
        gauge
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
    usdplus = await Want.attach(usdplusAddress);
    wsteth = await Want.attach(wstethAddress);
    velo = await Want.attach(veloAddress);
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

    xit('should allow implementation upgrades once timelock has passed', async function () {
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

  describe('Vault Tests', function () {
    xit('should allow deposits and account for them correctly', async function () {
      const userBalance = await want.balanceOf(wantHolderAddr);
      const vaultBalance = await vault.balance();
      const depositAmount = toWantUnit('0.0000003');
      await vault.connect(wantHolder).deposit(depositAmount);

      const newVaultBalance = await vault.balance();
      const newUserBalance = await want.balanceOf(wantHolderAddr);
      const allowedInaccuracy = depositAmount.div(200);
      expect(depositAmount).to.be.closeTo(newVaultBalance, allowedInaccuracy);
    });

    xit('should mint user their pool share', async function () {
      const userBalance = await want.balanceOf(wantHolderAddr);
      // const depositAmount = toWantUnit('0.0000001');
      const depositAmount = userBalance.div(10);
      await vault.connect(wantHolder).deposit(depositAmount);

      const ownerDepositAmount = userBalance.div(10);
      await want.connect(wantHolder).transfer(etherWhaleAddress, ownerDepositAmount);
      await want.connect(etherWhale).approve(vault.address, ethers.constants.MaxUint256);
      await vault.connect(etherWhale).depositAll();

      const allowedImprecision = ownerDepositAmount.div(1000);

      const userVaultBalance = await vault.balanceOf(wantHolderAddr);
      expect(userVaultBalance).to.be.closeTo(depositAmount, allowedImprecision);
      const ownerVaultBalance = await vault.balanceOf(etherWhaleAddress);
      expect(ownerVaultBalance).to.be.closeTo(ownerDepositAmount, allowedImprecision);

      await vault.connect(etherWhale).withdrawAll();
      const ownerWantBalance = await want.balanceOf(etherWhaleAddress);
      expect(ownerWantBalance).to.be.closeTo(ownerDepositAmount, allowedImprecision);
      const afterOwnerVaultBalance = await vault.balanceOf(etherWhaleAddress);
      expect(afterOwnerVaultBalance).to.equal(0);
    });

    xit('should allow withdrawals', async function () {
      const userBalance = await want.balanceOf(wantHolderAddr);
      const depositAmount = toWantUnit('0.0000003');
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

    it('should allow small withdrawal', async function () {
      const ownerDepositAmount = toWantUnit('0.00000003');
      await want.connect(wantHolder).transfer(owner.address, ownerDepositAmount);
      const userBalance = await want.balanceOf(wantHolderAddr);
      const depositAmount = toWantUnit('0.00000000000003');
      await vault.connect(wantHolder).deposit(depositAmount);

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
      console.log(`expected ${expectedBalance}`);
      console.log(`actual ${userBalanceAfterWithdraw}`);
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
      const userBalance = await want.balanceOf(wantHolderAddr);
      const depositAmount = userBalance.div(100);
      await vault.connect(wantHolder).deposit(depositAmount);
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

      const usdplusBalStrat = await usdplus.balanceOf(strategy.address);
      const veloBalStrat = await velo.balanceOf(strategy.address);
      const wstethBalStrat = await wsteth.balanceOf(strategy.address);
      const usdcBalStrat = await usdc.balanceOf(strategy.address);

      console.log(`usdplus ${usdplusBalStrat}`);
      console.log(`wsteth ${wstethBalStrat}`);
      console.log(`usdc ${usdcBalStrat}`);
      console.log(`velo ${veloBalStrat}`);
    });

    it('should provide yield', async function () {
      const userBalance = await want.balanceOf(wantHolderAddr);
      const depositAmount = userBalance.div(10);
      const timeToSkip = 3600;
      await vault.connect(wantHolder).deposit(depositAmount);
      const initialVaultBalance = await vault.balance();

      await strategy.updateHarvestLogCadence(1);

      const numHarvests = 5;
      // beets = Want.attach(beetsAddress);
      for (let i = 0; i < numHarvests; i++) {
        // await beets.connect(beetsHolder).transfer(strategy.address, toWantUnit('1'));
      await moveTimeForward(3600);
        await strategy.harvest();
      }

      const finalVaultBalance = await vault.balance();
      expect(finalVaultBalance).to.be.gt(initialVaultBalance);

      const averageAPR = await strategy.averageAPRAcrossLastNHarvests(numHarvests);
      console.log(`Average APR across ${numHarvests} harvests is ${averageAPR} basis points.`);
    });
  });
  describe('Strategy', function () {
    xit('should be able to pause and unpause', async function () {
      await strategy.pause();
      const depositAmount = toWantUnit('0.0000003');
      await expect(vault.connect(wantHolder).deposit(depositAmount)).to.be.reverted;

      await strategy.unpause();
      await expect(vault.connect(wantHolder).deposit(depositAmount)).to.not.be.reverted;
    });

    xit('should be able to panic', async function () {
      const depositAmount = toWantUnit('0.0000003');
      await vault.connect(wantHolder).deposit(depositAmount);
      const vaultBalance = await vault.balance();
      const strategyBalance = await strategy.balanceOf();
      await strategy.panic();

      const wantStratBalance = await want.balanceOf(strategy.address);
      const allowedImprecision = toWantUnit('0.0000000003');
      expect(strategyBalance).to.be.closeTo(wantStratBalance, allowedImprecision);
    });
  });
});
