async function main() {
  const vaultAddress = '0x0766AED42E9B48aa8F3E6bCAE925c6CF82B517eF';
  const strategyAddress = '0x0609B39b3efc80EC350e8787defAbC357fAD0bDC';

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
