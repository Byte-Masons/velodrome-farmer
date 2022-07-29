const hre = require('hardhat');

describe('Zapper', function () {
  let Zapper;
  let zapper;

  let Token;

  let Crypt;

  const veloRouterAddr = '0xa132DAB612dB5cB9fC9Ac426A0Cc215A3423F9c9';
  const wethAddr = '0x4200000000000000000000000000000000000006';

  beforeEach(async function () {
    // reset network
    await hre.network.provider.request({
      method: 'hardhat_reset',
      params: [
        {
          forking: {
            jsonRpcUrl: 'https://late-fragrant-rain.optimism.quiknode.pro/70171d2e7790f3af6a833f808abe5e85ed6bd881/',
          },
        },
      ],
    });

    // get artifacts
    Zapper = await hre.ethers.getContractFactory('ReaperVeloZap');
    Token = await hre.ethers.getContractFactory('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20');
    Crypt = await hre.ethers.getContractFactory('ReaperVaultv1_4');

    // deploy contracts
    zapper = await Zapper.deploy(veloRouterAddr, wethAddr);
    await zapper.deployed();
  });

  it('alETH-WETH sAMM estimate swaps', async () => {
    const cryptAddr = '0xD268887B2171c4b7595DeeBD0CB589c560682629';
    const token1Addr = wethAddr;
    const token2Addr = '0x3E29D3A9316dAB217754d13b28646B76607c5f04'; // alETH

    const token1 = await Token.attach(token1Addr);
    const token2 = await Token.attach(token2Addr);

    const token1Symbol = await token1.symbol();
    const token2Symbol = await token2.symbol();

    // estimate swaps
    await estimateSwaps(cryptAddr, token1Addr, token1Symbol, token2Symbol, [
      hre.ethers.utils.parseEther('1'),
      hre.ethers.utils.parseEther('3'),
      hre.ethers.utils.parseEther('5'),
      hre.ethers.utils.parseEther('10'),
      hre.ethers.utils.parseEther('50'),
    ]);
    await estimateSwaps(cryptAddr, token2Addr, token2Symbol, token1Symbol, [
      hre.ethers.utils.parseEther('1'),
      hre.ethers.utils.parseEther('3'),
      hre.ethers.utils.parseEther('5'),
      hre.ethers.utils.parseEther('10'),
      hre.ethers.utils.parseEther('50'),
    ]);
  });

  it('alETH-WETH sAMM zap in and out', async () => {
    const cryptAddr = '0xD268887B2171c4b7595DeeBD0CB589c560682629';
    const token1Addr = wethAddr;
    const token2Addr = '0x3E29D3A9316dAB217754d13b28646B76607c5f04'; // alETH

    const crypt = await Crypt.attach(cryptAddr);
    const lp = await Token.attach('0x6fD5BEe1Ddb4dbBB0b7368B080Ab99b8BA765902');
    const token1 = await Token.attach(token1Addr);
    const token2 = await Token.attach(token2Addr);

    // zapIn with 5 WETH
    const tokenHolderAddr = '0x68526A4295236D2f18cEda8A200CdDD5Aab9e2cC';
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [tokenHolderAddr],
    });
    const tokenHolder = await hre.ethers.provider.getSigner(tokenHolderAddr);
    await zapIn(hre.ethers.utils.parseEther('5'), token1, token2, lp, tokenHolder, tokenHolderAddr, crypt, cryptAddr);
    await zapOut(token1, token2, tokenHolder, tokenHolderAddr, crypt, cryptAddr);
  });

  it('alETH-WETH sAMM zap in and out (with swapping to WETH)', async () => {
    const cryptAddr = '0xD268887B2171c4b7595DeeBD0CB589c560682629';
    const token1Addr = wethAddr;
    const token2Addr = '0x3E29D3A9316dAB217754d13b28646B76607c5f04'; // alETH

    const crypt = await Crypt.attach(cryptAddr);
    const lp = await Token.attach('0x6fD5BEe1Ddb4dbBB0b7368B080Ab99b8BA765902');
    const token1 = await Token.attach(token1Addr);
    const token2 = await Token.attach(token2Addr);

    // zapIn with 5 WETH
    const tokenHolderAddr = '0x68526A4295236D2f18cEda8A200CdDD5Aab9e2cC';
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [tokenHolderAddr],
    });
    const tokenHolder = await hre.ethers.provider.getSigner(tokenHolderAddr);
    await zapIn(hre.ethers.utils.parseEther('5'), token1, token2, lp, tokenHolder, tokenHolderAddr, crypt, cryptAddr);
    await zapOut(token1, token2, tokenHolder, tokenHolderAddr, crypt, cryptAddr, token1);
  });

  it('alETH-WETH sAMM zap in and out (with swapping to alETH)', async () => {
    const cryptAddr = '0xD268887B2171c4b7595DeeBD0CB589c560682629';
    const token1Addr = wethAddr;
    const token2Addr = '0x3E29D3A9316dAB217754d13b28646B76607c5f04'; // alETH

    const crypt = await Crypt.attach(cryptAddr);
    const lp = await Token.attach('0x6fD5BEe1Ddb4dbBB0b7368B080Ab99b8BA765902');
    const token1 = await Token.attach(token1Addr);
    const token2 = await Token.attach(token2Addr);

    // zapIn with 5 WETH
    const tokenHolderAddr = '0x68526A4295236D2f18cEda8A200CdDD5Aab9e2cC';
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [tokenHolderAddr],
    });
    const tokenHolder = await hre.ethers.provider.getSigner(tokenHolderAddr);
    await zapIn(hre.ethers.utils.parseEther('5'), token1, token2, lp, tokenHolder, tokenHolderAddr, crypt, cryptAddr);
    await zapOut(token1, token2, tokenHolder, tokenHolderAddr, crypt, cryptAddr, token2);
  });

  it('OP-L2DAO vAMM estimate swaps', async () => {
    const cryptAddr = '0x1B4Fd39128B9caDfdfe62fb8C519061D5227D4b9';
    const token1Addr = '0x4200000000000000000000000000000000000042'; // OP
    const token2Addr = '0xd52f94DF742a6F4B4C8b033369fE13A41782Bf44'; // L2DAO

    const token1 = await Token.attach(token1Addr);
    const token2 = await Token.attach(token2Addr);

    const token1Symbol = await token1.symbol();
    const token2Symbol = await token2.symbol();

    // estimate swaps
    await estimateSwaps(cryptAddr, token1Addr, token1Symbol, token2Symbol, [
      hre.ethers.utils.parseEther('100'),
      hre.ethers.utils.parseEther('300'),
      hre.ethers.utils.parseEther('500'),
      hre.ethers.utils.parseEther('10000'),
      hre.ethers.utils.parseEther('50000'),
    ]);
    await estimateSwaps(cryptAddr, token2Addr, token2Symbol, token1Symbol, [
      hre.ethers.utils.parseEther('100'),
      hre.ethers.utils.parseEther('300'),
      hre.ethers.utils.parseEther('500'),
      hre.ethers.utils.parseEther('10000'),
      hre.ethers.utils.parseEther('50000'),
    ]);
  });

  it('OP-L2DAO vAMM zap in and out', async () => {
    const cryptAddr = '0x1B4Fd39128B9caDfdfe62fb8C519061D5227D4b9';
    const token1Addr = '0x4200000000000000000000000000000000000042'; // OP
    const token2Addr = '0xd52f94DF742a6F4B4C8b033369fE13A41782Bf44'; // L2DAO

    const crypt = await Crypt.attach(cryptAddr);
    const lp = await Token.attach('0xfc77e39De40E54F820E313039207DC850E4C9E60');
    const token1 = await Token.attach(token1Addr);
    const token2 = await Token.attach(token2Addr);

    // zapIn with 5000 L2DAO
    const tokenHolderAddr = '0x357990585a6BB953DCBA126de48585ed27E22319';
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [tokenHolderAddr],
    });
    const tokenHolder = await hre.ethers.provider.getSigner(tokenHolderAddr);
    await zapIn(
      hre.ethers.utils.parseEther('5000'),
      token2,
      token1,
      lp,
      tokenHolder,
      tokenHolderAddr,
      crypt,
      cryptAddr,
    );
    await zapOut(token2, token1, tokenHolder, tokenHolderAddr, crypt, cryptAddr);
  });

  it('OP-L2DAO vAMM zap in and out (with swapping to OP)', async () => {
    const cryptAddr = '0x1B4Fd39128B9caDfdfe62fb8C519061D5227D4b9';
    const token1Addr = '0x4200000000000000000000000000000000000042'; // OP
    const token2Addr = '0xd52f94DF742a6F4B4C8b033369fE13A41782Bf44'; // L2DAO

    const crypt = await Crypt.attach(cryptAddr);
    const lp = await Token.attach('0xfc77e39De40E54F820E313039207DC850E4C9E60');
    const token1 = await Token.attach(token1Addr);
    const token2 = await Token.attach(token2Addr);

    // zapIn with 5000 L2DAO
    const tokenHolderAddr = '0x357990585a6BB953DCBA126de48585ed27E22319';
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [tokenHolderAddr],
    });
    const tokenHolder = await hre.ethers.provider.getSigner(tokenHolderAddr);
    await zapIn(
      hre.ethers.utils.parseEther('5000'),
      token2,
      token1,
      lp,
      tokenHolder,
      tokenHolderAddr,
      crypt,
      cryptAddr,
    );
    await zapOut(token2, token1, tokenHolder, tokenHolderAddr, crypt, cryptAddr, token1);
  });

  it('OP-L2DAO vAMM zap in and out (with swapping to L2DAO)', async () => {
    const cryptAddr = '0x1B4Fd39128B9caDfdfe62fb8C519061D5227D4b9';
    const token1Addr = '0x4200000000000000000000000000000000000042'; // OP
    const token2Addr = '0xd52f94DF742a6F4B4C8b033369fE13A41782Bf44'; // L2DAO

    const crypt = await Crypt.attach(cryptAddr);
    const lp = await Token.attach('0xfc77e39De40E54F820E313039207DC850E4C9E60');
    const token1 = await Token.attach(token1Addr);
    const token2 = await Token.attach(token2Addr);

    // zapIn with 5000 L2DAO
    const tokenHolderAddr = '0x357990585a6BB953DCBA126de48585ed27E22319';
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [tokenHolderAddr],
    });
    const tokenHolder = await hre.ethers.provider.getSigner(tokenHolderAddr);
    await zapIn(
      hre.ethers.utils.parseEther('5000'),
      token2,
      token1,
      lp,
      tokenHolder,
      tokenHolderAddr,
      crypt,
      cryptAddr,
    );
    await zapOut(token2, token1, tokenHolder, tokenHolderAddr, crypt, cryptAddr, token2);
  });

  async function estimateSwaps(cryptAddr, token1Addr, token1Symbol, token2Symbol, amounts) {
    for (let i = 0; i < amounts.length; i++) {
      const estimateOutput = await zapper.estimateSwap(cryptAddr, token1Addr, amounts[i]);
      const swapAmountIn = hre.ethers.utils.formatEther(estimateOutput.swapAmountIn);
      const swapAmountOut = hre.ethers.utils.formatEther(estimateOutput.swapAmountOut);
      console.log(
        `Sending ${hre.ethers.utils.formatEther(
          amounts[i],
        )} ${token1Symbol}.. ${swapAmountIn} ${token1Symbol} will be swapped to produce ${swapAmountOut} ${token2Symbol}`,
      );
    }
  }

  async function zapIn(amount, tokenIn, otherToken, lpToken, tokenHolder, tokenHolderAddr, crypt, cryptAddr) {
    const tokenInSymbol = await tokenIn.symbol();
    const otherTokenSymbol = await otherToken.symbol();

    const estimateOutput = await zapper.estimateSwap(cryptAddr, tokenIn.address, amount);
    const swapAmountOut = estimateOutput.swapAmountOut;

    console.log(`\n----------Zapping in with ${hre.ethers.utils.formatEther(amount)} ${tokenInSymbol}----------`);
    await tokenIn.connect(tokenHolder).approve(zapper.address, hre.ethers.constants.MaxUint256);
    console.log(
      `Starting user ETH (native) balance = ${hre.ethers.utils.formatEther(
        await hre.ethers.provider.getBalance(tokenHolderAddr),
      )}`,
    );
    console.log(
      `Starting user ${tokenInSymbol} balance = ${hre.ethers.utils.formatEther(
        await tokenIn.balanceOf(tokenHolderAddr),
      )}`,
    );
    console.log(
      `Starting user ${otherTokenSymbol} balance = ${hre.ethers.utils.formatEther(
        await otherToken.balanceOf(tokenHolderAddr),
      )}`,
    );
    console.log(`Starting user LP balance = ${hre.ethers.utils.formatEther(await lpToken.balanceOf(tokenHolderAddr))}`);
    await zapper.connect(tokenHolder).reapIn(cryptAddr, swapAmountOut, tokenIn.address, amount);
    console.log(
      `\nPost-zap user ETH (native) balance = ${hre.ethers.utils.formatEther(
        await hre.ethers.provider.getBalance(tokenHolderAddr),
      )}`,
    );
    console.log(
      `Post-zap user ${tokenInSymbol} balance = ${hre.ethers.utils.formatEther(
        await tokenIn.balanceOf(tokenHolderAddr),
      )}`,
    );
    console.log(
      `Post-zap user ${otherTokenSymbol} balance = ${hre.ethers.utils.formatEther(
        await otherToken.balanceOf(tokenHolderAddr),
      )}`,
    );
    let endingShareBal = await crypt.balanceOf(tokenHolderAddr);
    console.log(`Post-zap user crypt share balance = ${hre.ethers.utils.formatEther(endingShareBal)}`);
    const ppfs = await crypt.getPricePerFullShare();
    let endingLPBal = ppfs.mul(endingShareBal).div(hre.ethers.utils.parseEther('1'));
    console.log(`Post-zap user LP balance (from ppfs) = ${hre.ethers.utils.formatEther(endingLPBal)}`);

    console.log(
      `Post-zap zapper ETH (native) balance = ${hre.ethers.utils.formatEther(
        await hre.ethers.provider.getBalance(zapper.address),
      )}`,
    );
    console.log(
      `Post-zap zapper ${tokenInSymbol} balance = ${hre.ethers.utils.formatEther(
        await tokenIn.balanceOf(zapper.address),
      )}`,
    );
    console.log(
      `Post-zap zapper ${otherTokenSymbol} balance = ${hre.ethers.utils.formatEther(
        await otherToken.balanceOf(zapper.address),
      )}`,
    );
    endingShareBal = await crypt.balanceOf(zapper.address);
    console.log(`Post-zap zapper crypt share balance = ${hre.ethers.utils.formatEther(endingShareBal)}`);
    endingLPBal = ppfs.mul(endingShareBal).div(hre.ethers.utils.parseEther('1'));
    console.log(`Post-zap zapper LP balance (from ppfs) = ${hre.ethers.utils.formatEther(endingLPBal)}`);
  }

  async function zapOut(tokenIn, otherToken, tokenHolder, tokenHolderAddr, crypt, cryptAddr, desiredOutputToken) {
    const tokenInSymbol = await tokenIn.symbol();
    const otherTokenSymbol = await otherToken.symbol();

    if (desiredOutputToken !== undefined) {
      console.log(`\nZapping back out (swapping to ${await desiredOutputToken.symbol()})`);
    } else {
      console.log(`\nZapping back out (without swapping)`);
    }
    await crypt.connect(tokenHolder).approve(zapper.address, hre.ethers.constants.MaxUint256);
    if (desiredOutputToken !== undefined) {
      await zapper
        .connect(tokenHolder)
        .reapOutAndSwap(cryptAddr, await crypt.balanceOf(tokenHolderAddr), desiredOutputToken.address, 0);
    } else {
      await zapper.connect(tokenHolder).reapOut(cryptAddr, await crypt.balanceOf(tokenHolderAddr));
    }
    console.log(
      `\nFinal user ETH (native) balance = ${hre.ethers.utils.formatEther(
        await hre.ethers.provider.getBalance(tokenHolderAddr),
      )}`,
    );
    console.log(
      `Final user ${tokenInSymbol} balance = ${hre.ethers.utils.formatEther(await tokenIn.balanceOf(tokenHolderAddr))}`,
    );
    console.log(
      `Final user ${otherTokenSymbol} balance = ${hre.ethers.utils.formatEther(
        await otherToken.balanceOf(tokenHolderAddr),
      )}`,
    );
    let endingShareBal = await crypt.balanceOf(tokenHolderAddr);
    console.log(`Final user crypt share balance = ${hre.ethers.utils.formatEther(endingShareBal)}`);
    const ppfs = await crypt.getPricePerFullShare();
    let endingLPBal = ppfs.mul(endingShareBal).div(hre.ethers.utils.parseEther('1'));
    console.log(`Final user LP balance (from ppfs) = ${hre.ethers.utils.formatEther(endingLPBal)}`);

    console.log(
      `Final zapper ETH (native) balance = ${hre.ethers.utils.formatEther(
        await hre.ethers.provider.getBalance(zapper.address),
      )}`,
    );
    console.log(
      `Final zapper ${tokenInSymbol} balance = ${hre.ethers.utils.formatEther(
        await tokenIn.balanceOf(zapper.address),
      )}`,
    );
    console.log(
      `Final zapper ${otherTokenSymbol} balance = ${hre.ethers.utils.formatEther(
        await otherToken.balanceOf(zapper.address),
      )}`,
    );
    endingShareBal = await crypt.balanceOf(zapper.address);
    console.log(`Final zapper crypt share balance = ${hre.ethers.utils.formatEther(endingShareBal)}`);
    endingLPBal = ppfs.mul(endingShareBal).div(hre.ethers.utils.parseEther('1'));
    console.log(`Final zapper LP balance (from ppfs) = ${hre.ethers.utils.formatEther(endingLPBal)}`);
  }
});
