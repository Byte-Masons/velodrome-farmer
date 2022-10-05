async function main() {
  const vaultAddress = '0xFA43948C857a201386a99CBc07A099C56fe04580';
  const strategyAddress = '0xF645557308c489AaAF0595b3270C2dDe29F317e4';

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
