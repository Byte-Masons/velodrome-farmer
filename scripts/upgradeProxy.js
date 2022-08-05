async function main() {
  const stratFactory = await ethers.getContractFactory('ReaperStrategyVelodromeStable');
  const stratContract = await hre.upgrades.upgradeProxy('0x0903c7Cd8BF1E6F46d23A476202bf1400C5C271F', stratFactory);
  console.log('Strategy upgraded!');
  // const stratContract = await stratFactory.attach('0x0310b9979BcC17fa2DB4cEC4417FCebabc405F1D');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
