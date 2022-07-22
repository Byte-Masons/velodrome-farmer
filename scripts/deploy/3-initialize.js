async function main() {
  const vaultAddress = '0x50d1666f8048F88bAE6B23CC0d09fCC259065441';
  const strategyAddress = '0x4d3B0b33A287361b1Ad9Df9dc54C3b3e0523e2Cb';

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
