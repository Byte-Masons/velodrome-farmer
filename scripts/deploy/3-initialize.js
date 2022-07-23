async function main() {
  const vaultAddress = '0x7d3063f7693D8de76E4Ed0B615Eb3A36cA1a6C25';
  const strategyAddress = '0x8B6e31f3286b4D0B611Ff326E9682651A893aD70';

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
