async function main() {
  const vaultAddress = '0x83Cf5e8B98Ff3bbF2237fe7411e6B03C57c7a0EC';
  const strategyAddress = '0x259e6198DD81293928dF0D63Ee81CF511f9595cd';

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
