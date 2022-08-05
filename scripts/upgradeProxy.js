async function main() {
  const stratFactory = await ethers.getContractFactory('ReaperStrategyVelodromeUsdcStable');
  const stratContract = await hre.upgrades.upgradeProxy('0x3cE5A4CD0A9FB49686B26237cd2BE2b2FA8DC04F', stratFactory);
  console.log('Strategy upgraded!');
  // const stratContract = await stratFactory.attach('0x0310b9979BcC17fa2DB4cEC4417FCebabc405F1D');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
