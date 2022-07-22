async function main() {
  const vaultAddress = '0x02E3eFeD80972ea6B4c53c742e10488D1efC0Fe2';
  const strategyAddress = '0x323c6f5eB0bCA20e197425e266311bf9F3fF46F8';

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
