async function main() {
  const vaultAddress = '0xD268887B2171c4b7595DeeBD0CB589c560682629';
  const strategyAddress = '0xfA48340039037f6a6b099eFde699A6eAb3802a03';

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
