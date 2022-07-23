async function main() {
  const vaultAddress = '0x75f29A89107ff590f3b65759e8e6F9943149c27a';
  const strategyAddress = '0xCDb61c99E46b6111f9e8493f09FE548E6BCF85B1';

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
