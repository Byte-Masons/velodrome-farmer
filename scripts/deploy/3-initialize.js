async function main() {
  const vaultAddress = '0x01e4D996240F677a057b19DB300060BD20a8F7a9';
  const strategyAddress = '0x56fD6d268334741C7d56464dd5b01f6132972818';

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
