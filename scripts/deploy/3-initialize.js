async function main() {
  const vaultAddress = '0xD4f64A36d0E9f00E499c35A5f8b90183D8ab3305';
  const strategyAddress = '0x0903c7Cd8BF1E6F46d23A476202bf1400C5C271F';

  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');
  const vault = Vault.attach(vaultAddress);

  await vault.initialize(strategyAddress);
  console.log('Vault initialized');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
