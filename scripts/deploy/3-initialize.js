async function main() {
  const vaultAddress = '0xFE24e5c6bd0721b5b69e10Da687796Ba63F3BF81';
  const strategyAddress = '0x5A06cAB77BeB2E99247Cd23504363F1BFB7C1BDF';

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
