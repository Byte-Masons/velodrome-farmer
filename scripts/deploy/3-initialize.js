async function main() {
  const vaultAddress = '0x56756c847B027a27703aaD58c732C041f4e5f033';
  const strategyAddress = '0xefd98ec23B80F2e85Aa3107f439946E336EC9034';

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
