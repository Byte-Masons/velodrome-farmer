async function main() {
  const vaultAddress = '0xC7670686529791d9C62eAa4D3B4745BB84a3a1CE';
  const strategyAddress = '0xC073f6B833E71d03e20a80a1C0e6B8566233DA1A';

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
