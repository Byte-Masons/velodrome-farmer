async function main() {
  const vaultAddress = '0x1047Afc683Abc40314B29DFD686BB178ebEB4F44';
  const strategyAddress = '0xA6D727cAF1f99943331A58e471a88156dB90577f';

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
