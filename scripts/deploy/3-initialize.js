async function main() {
  const vaultAddress = '0x6045E787688C7550bCc3dec551c54c57f13E6204';
  const strategyAddress = '0x04b8a4a5CFaBa7E213d77E496d4ee39f47F4B289';

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
