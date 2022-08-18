async function main() {
  const vaultAddress = '0x15fbF2F74FaA5400c1CCb9cFB0aC8294Be3A0272';
  const strategyAddress = '0xCAd929915D9b8D7655c17e94D0C5cDf2793E7EAA';

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
