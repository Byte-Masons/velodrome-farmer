async function main() {
  const vaultAddress = '0xA4226E6833e5C6F83628c25922a383495c3d2259';
  const strategyAddress = '0xDc7c36282eb0F42Dd739968F3E3d5Bf075BdA6Cc';

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
