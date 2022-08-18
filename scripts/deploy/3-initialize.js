async function main() {
  const vaultAddress = '0xa15e86A4b596978410163c5A3f26D132BF03E333';
  const strategyAddress = '0x6cA9EA8FB6F48C496dB2A5dCb7aB4f0aD6d57451';

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
