async function main() {
  const vaultAddress = '0x2B2CE9Ea2a8428CE4c4Dcd0c19a931968D2F1e7b';
  const strategyAddress = '0xAFb98c29CA654eAc2C327B3de227B30172F67857';

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
