async function main() {
  const vaultAddress = '0xbdf94B9D813AE4B54D9B221C6fd003AF2e1B8432';
  const strategyAddress = '0x8fA82f61153E7746112Cb4e9de1033504C3294eE';

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
