async function main() {
  const vaultAddress = '0x64da5E89b347aD033615AFcC5A585Db3f38A1ae2';
  const strategyAddress = '0x396Be32F26c98dD6C6Cc813eaaF59C6C3e1101d5';

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
