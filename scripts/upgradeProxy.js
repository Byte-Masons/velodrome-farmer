async function main() {
  const stratFactory = await ethers.getContractFactory('ReaperStrategyVelodromeUsdcStable');
  const stratContract = await hre.upgrades.upgradeProxy('0x8B6e31f3286b4D0B611Ff326E9682651A893aD70', stratFactory);
  console.log('Strategy upgraded!');
  // const stratContract = await stratFactory.attach('0x0310b9979BcC17fa2DB4cEC4417FCebabc405F1D');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
