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

  it('alETH-WETH sAMM', async function () {
    const cryptAddr = '0xD268887B2171c4b7595DeeBD0CB589c560682629';
    const alETHAddr = '0x3E29D3A9316dAB217754d13b28646B76607c5f04';

    const crypt = await Crypt.attach(cryptAddr);
    const lp = await Token.attach('0x6fD5BEe1Ddb4dbBB0b7368B080Ab99b8BA765902');
    const weth = await Token.attach(wethAddr);
    const alEth = await Token.attach(alETHAddr);
    let tokenAmountOutMinAlEth, tokenAmountOutMinWeth;

    // estimate swaps
    // 1 WETH
    let estimateOutput = await zapper.estimateSwap(cryptAddr, wethAddr, hre.ethers.utils.parseEther('1'));
    let swapAmountIn = hre.ethers.utils.formatEther(estimateOutput.swapAmountIn);
    let swapAmountOut = hre.ethers.utils.formatEther(estimateOutput.swapAmountOut);
    console.log(`Sending 1 WETH.. ${swapAmountIn} WETH will be swapped to produce ${swapAmountOut} alETH`);

    // 3 WETH
    estimateOutput = await zapper.estimateSwap(cryptAddr, wethAddr, hre.ethers.utils.parseEther('3'));
    swapAmountIn = hre.ethers.utils.formatEther(estimateOutput.swapAmountIn);
    swapAmountOut = hre.ethers.utils.formatEther(estimateOutput.swapAmountOut);
    console.log(`Sending 3 WETH.. ${swapAmountIn} WETH will be swapped to produce ${swapAmountOut} alETH`);

    // 5 WETH
    estimateOutput = await zapper.estimateSwap(cryptAddr, wethAddr, hre.ethers.utils.parseEther('5'));
    swapAmountIn = hre.ethers.utils.formatEther(estimateOutput.swapAmountIn);
    swapAmountOut = hre.ethers.utils.formatEther(estimateOutput.swapAmountOut);
    tokenAmountOutMinAlEth = estimateOutput.swapAmountOut;
    console.log(`Sending 5 WETH.. ${swapAmountIn} WETH will be swapped to produce ${swapAmountOut} alETH`);

    // 10 WETH
    estimateOutput = await zapper.estimateSwap(cryptAddr, wethAddr, hre.ethers.utils.parseEther('10'));
    swapAmountIn = hre.ethers.utils.formatEther(estimateOutput.swapAmountIn);
    swapAmountOut = hre.ethers.utils.formatEther(estimateOutput.swapAmountOut);
    console.log(`Sending 10 WETH.. ${swapAmountIn} WETH will be swapped to produce ${swapAmountOut} alETH`);

    // 50 WETH
    estimateOutput = await zapper.estimateSwap(cryptAddr, wethAddr, hre.ethers.utils.parseEther('50'));
    swapAmountIn = hre.ethers.utils.formatEther(estimateOutput.swapAmountIn);
    swapAmountOut = hre.ethers.utils.formatEther(estimateOutput.swapAmountOut);
    console.log(`Sending 50 WETH.. ${swapAmountIn} WETH will be swapped to produce ${swapAmountOut} alETH`);

    // 1 alETH
    estimateOutput = await zapper.estimateSwap(cryptAddr, alETHAddr, hre.ethers.utils.parseEther('1'));
    swapAmountIn = hre.ethers.utils.formatEther(estimateOutput.swapAmountIn);
    swapAmountOut = hre.ethers.utils.formatEther(estimateOutput.swapAmountOut);
    console.log(`Sending 1 alETH.. ${swapAmountIn} alETH will be swapped to produce ${swapAmountOut} WETH`);

    // 3 alETH
    estimateOutput = await zapper.estimateSwap(cryptAddr, alETHAddr, hre.ethers.utils.parseEther('3'));
    swapAmountIn = hre.ethers.utils.formatEther(estimateOutput.swapAmountIn);
    swapAmountOut = hre.ethers.utils.formatEther(estimateOutput.swapAmountOut);
    console.log(`Sending 3 alETH.. ${swapAmountIn} alETH will be swapped to produce ${swapAmountOut} WETH`);

    // 5 alETH
    estimateOutput = await zapper.estimateSwap(cryptAddr, alETHAddr, hre.ethers.utils.parseEther('5'));
    swapAmountIn = hre.ethers.utils.formatEther(estimateOutput.swapAmountIn);
    swapAmountOut = hre.ethers.utils.formatEther(estimateOutput.swapAmountOut);
    tokenAmountOutMinWeth = estimateOutput.swapAmountOut;
    console.log(`Sending 5 alETH.. ${swapAmountIn} alETH will be swapped to produce ${swapAmountOut} WETH`);

    // 10 alETH
    estimateOutput = await zapper.estimateSwap(cryptAddr, alETHAddr, hre.ethers.utils.parseEther('10'));
    swapAmountIn = hre.ethers.utils.formatEther(estimateOutput.swapAmountIn);
    swapAmountOut = hre.ethers.utils.formatEther(estimateOutput.swapAmountOut);
    console.log(`Sending 10 alETH.. ${swapAmountIn} alETH will be swapped to produce ${swapAmountOut} WETH`);

    // 50 alETH
    estimateOutput = await zapper.estimateSwap(cryptAddr, alETHAddr, hre.ethers.utils.parseEther('50'));
    swapAmountIn = hre.ethers.utils.formatEther(estimateOutput.swapAmountIn);
    swapAmountOut = hre.ethers.utils.formatEther(estimateOutput.swapAmountOut);
    console.log(`Sending 50 alETH.. ${swapAmountIn} alETH will be swapped to produce ${swapAmountOut} WETH`);

    // zapIn with 5 WETH
    let tokenHolderAddr = '0x68526A4295236D2f18cEda8A200CdDD5Aab9e2cC';
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [tokenHolderAddr],
    });
    let tokenHolder = await hre.ethers.provider.getSigner(tokenHolderAddr);

    console.log(`\n----------Zapping in with 5 WETH----------`);
    await weth.connect(tokenHolder).approve(zapper.address, hre.ethers.constants.MaxUint256);
    console.log(
      `Starting user ETH (native) balance = ${hre.ethers.utils.formatEther(
        await hre.ethers.provider.getBalance(tokenHolderAddr),
      )}`,
    );
    console.log(`Starting user WETH balance = ${hre.ethers.utils.formatEther(await weth.balanceOf(tokenHolderAddr))}`);
    console.log(
      `Starting user alETH balance = ${hre.ethers.utils.formatEther(await alEth.balanceOf(tokenHolderAddr))}`,
    );
    console.log(`Starting user LP balance = ${hre.ethers.utils.formatEther(await lp.balanceOf(tokenHolderAddr))}`);
    await zapper
      .connect(tokenHolder)
      .reapIn(cryptAddr, tokenAmountOutMinAlEth, wethAddr, hre.ethers.utils.parseEther('5'));
    console.log(
      `\nPost-zap user ETH (native) balance = ${hre.ethers.utils.formatEther(
        await hre.ethers.provider.getBalance(tokenHolderAddr),
      )}`,
    );
    console.log(`Post-zap user WETH balance = ${hre.ethers.utils.formatEther(await weth.balanceOf(tokenHolderAddr))}`);
    console.log(
      `Post-zap user alETH balance = ${hre.ethers.utils.formatEther(await alEth.balanceOf(tokenHolderAddr))}`,
    );
    let endingShareBal = await crypt.balanceOf(tokenHolderAddr);
    console.log(`Post-zap user crypt share balance = ${hre.ethers.utils.formatEther(endingShareBal)}`);
    let ppfs = await crypt.getPricePerFullShare();
    let endingLPBal = ppfs.mul(endingShareBal).div(hre.ethers.utils.parseEther('1'));
    console.log(`Post-zap user LP balance (from ppfs) = ${hre.ethers.utils.formatEther(endingLPBal)}`);

    console.log(
      `Post-zap zapper ETH (native) balance = ${hre.ethers.utils.formatEther(
        await hre.ethers.provider.getBalance(zapper.address),
      )}`,
    );
    console.log(`Post-zap zapper WETH balance = ${hre.ethers.utils.formatEther(await weth.balanceOf(zapper.address))}`);
    console.log(
      `Post-zap zapper alETH balance = ${hre.ethers.utils.formatEther(await alEth.balanceOf(zapper.address))}`,
    );
    endingShareBal = await crypt.balanceOf(zapper.address);
    console.log(`Post-zap zapper crypt share balance = ${hre.ethers.utils.formatEther(endingShareBal)}`);
    endingLPBal = ppfs.mul(endingShareBal).div(hre.ethers.utils.parseEther('1'));
    console.log(`Post-zap zapper LP balance (from ppfs) = ${hre.ethers.utils.formatEther(endingLPBal)}`);

    console.log(`\nZapping back out (without swapping)`);
    await crypt.connect(tokenHolder).approve(zapper.address, hre.ethers.constants.MaxUint256);
    await zapper.connect(tokenHolder).reapOut(cryptAddr, await crypt.balanceOf(tokenHolderAddr));
    console.log(
      `\nFinal user ETH (native) balance = ${hre.ethers.utils.formatEther(
        await hre.ethers.provider.getBalance(tokenHolderAddr),
      )}`,
    );
    console.log(`Final user WETH balance = ${hre.ethers.utils.formatEther(await weth.balanceOf(tokenHolderAddr))}`);
    console.log(`Final user alETH balance = ${hre.ethers.utils.formatEther(await alEth.balanceOf(tokenHolderAddr))}`);
    endingShareBal = await crypt.balanceOf(tokenHolderAddr);
    console.log(`Final user crypt share balance = ${hre.ethers.utils.formatEther(endingShareBal)}`);
    ppfs = await crypt.getPricePerFullShare();
    endingLPBal = ppfs.mul(endingShareBal).div(hre.ethers.utils.parseEther('1'));
    console.log(`Final user LP balance (from ppfs) = ${hre.ethers.utils.formatEther(endingLPBal)}`);

    console.log(
      `\nFinal zapper ETH (native) balance = ${hre.ethers.utils.formatEther(
        await hre.ethers.provider.getBalance(zapper.address),
      )}`,
    );
    console.log(`Final zapper WETH balance = ${hre.ethers.utils.formatEther(await weth.balanceOf(zapper.address))}`);
    console.log(`Final zapper alETH balance = ${hre.ethers.utils.formatEther(await alEth.balanceOf(zapper.address))}`);
    endingShareBal = await crypt.balanceOf(zapper.address);
    console.log(`Final zapper crypt share balance = ${hre.ethers.utils.formatEther(endingShareBal)}`);
    endingLPBal = ppfs.mul(endingShareBal).div(hre.ethers.utils.parseEther('1'));
    console.log(`Final zapper LP balance (from ppfs) = ${hre.ethers.utils.formatEther(endingLPBal)}`);
  });
});
