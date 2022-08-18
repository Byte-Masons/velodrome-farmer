async function main() {
  const vaultAddress = '0xc5666f7c50dBb9BFafDE29d5ED190A31FFCa8370';
  const strategyAddress = '0x16d082a1B028914B8C7301549F7Fe4398111dB8a';

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
