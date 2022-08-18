async function main() {
  const vaultAddress = '0x557b10781DFAe44Ad008EA1c7A281C230F4E4C1d';
  const strategyAddress = '0x9dF45d2bEaf86A35781BF2B918999e7fc6dCcd06';

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
