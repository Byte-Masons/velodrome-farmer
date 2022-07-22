async function main() {
  const vaultAddress = '0x111A9B77f95B1E024DF162b42DeC0A2B1C51A00E';
  const strategyAddress = '0xa8c41AB18133e566B8CD0349Eca19E3707Aaad01';

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
