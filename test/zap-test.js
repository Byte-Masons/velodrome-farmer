const hre = require('hardhat');

describe('Zapper', function () {
  let Zapper;
  let zapper;

  let Token;

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

    // deploy contracts
    zapper = await Zapper.deploy(veloRouterAddr, wethAddr);
    await zapper.deployed();
  });

  it('alETH-WETH sAMM', async function () {
    const cryptAddr = '0xD268887B2171c4b7595DeeBD0CB589c560682629';
    const alETHAddr = '0x3E29D3A9316dAB217754d13b28646B76607c5f04';

    const crypt = await Token.attach(cryptAddr);
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

    console.log(
      `WETH allowance for zapper = ${hre.ethers.utils.formatEther(
        await weth.allowance(tokenHolderAddr, zapper.address),
      )}`,
    );
    const approveTx = await weth.connect(tokenHolder).approve(zapper.address, hre.ethers.utils.parseEther('5'));
    await approveTx.wait();

    console.log(`Zapping in with 5 WETH`);
    console.log(`Starting WETH balance = ${hre.ethers.utils.formatEther(await weth.balanceOf(tokenHolderAddr))}`);
    console.log(`Starting alETH balance = ${hre.ethers.utils.formatEther(await alEth.balanceOf(tokenHolderAddr))}`);
    console.log(`Starting LP balance = ${hre.ethers.utils.formatEther(await lp.balanceOf(tokenHolderAddr))}`);
    console.log(
      `WETH allowance for zapper = ${hre.ethers.utils.formatEther(
        await weth.allowance(tokenHolderAddr, zapper.address),
      )}`,
    );
    console.log(weth.address);
    await zapper.reapIn(cryptAddr, tokenAmountOutMinAlEth, wethAddr, hre.ethers.utils.parseEther('5'));
    console.log(`Ending WETH balance = ${hre.ethers.utils.formatEther(await weth.balanceOf(tokenHolderAddr))}`);
    console.log(`Ending alETH balance = ${hre.ethers.utils.formatEther(await alEth.balanceOf(tokenHolderAddr))}`);
    console.log(`Ending crypt share balance = ${hre.ethers.utils.formatEther(await crypt.balanceOf(tokenHolderAddr))}`);
    console.log(`Ending LP balance = ${hre.ethers.utils.formatEther(await lp.balanceOf(tokenHolderAddr))}`);
  });
});
