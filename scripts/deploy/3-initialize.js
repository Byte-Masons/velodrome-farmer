async function main() {
  const vaultAddress = '0xec7C00cE4d63f06D4C2bb7D63E032911996E70Ef';
  const strategyAddress = '0xA7A0FAC77c7C711b2ae00f0F483321BF022d4D24';

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
