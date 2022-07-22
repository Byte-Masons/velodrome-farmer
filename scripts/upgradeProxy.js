async function main() {
  const stratFactory = await ethers.getContractFactory('ReaperStrategyHappyRoad');
  const stratContract = await hre.upgrades.upgradeProxy('0x8fA82f61153E7746112Cb4e9de1033504C3294eE', stratFactory);
  console.log('Strategy upgraded!');
  // const stratContract = await stratFactory.attach('0x0310b9979BcC17fa2DB4cEC4417FCebabc405F1D');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
