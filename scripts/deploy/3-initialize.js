async function main() {
  const vaultAddress = '0xF3E54C02d2279418Cd36AddFc935b4d8B032FdF7';
  const strategyAddress = '0x9FC9443Af565e1d2d23871b608Ef31EBCD32B700';

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
