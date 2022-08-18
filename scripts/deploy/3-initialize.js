async function main() {
  const vaultAddress = '0x53B788691D66ee50c8F36d153921b37f85432FAc';
  const strategyAddress = '0x330A132dC55D77bc349520697e5ECf892d8EC63a';

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
