async function main() {
  const vaultAddress = '0x8BBB9dd9AE557f20802685659A87a15d3cd0C266';
  const strategyAddress = '0xB7cEc81D391e745D7C0679BE95f862a29B3d59db';

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
