async function main() {
  const vaultAddress = '0x01EAFb9d744a652e71f554cd8946bFbCd38f5b96';
  const strategyAddress = '0xDC233910a2f71D2734A8Cad1Ca2d936df805bb62';

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
