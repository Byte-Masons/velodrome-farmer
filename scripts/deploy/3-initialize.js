async function main() {
  const vaultAddress = '0xc72C4437824866eF48A0e8455831c21022a12592';
  const strategyAddress = '0x3cE5A4CD0A9FB49686B26237cd2BE2b2FA8DC04F';

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
