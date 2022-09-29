async function main() {
  const vaultAddress = '0xDc015935dd936450b9d116C3Fa66CA3Ad3afc109';
  const strategyAddress = '0x9e7176b445956559e228C82aBf03687a017651E5';

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
