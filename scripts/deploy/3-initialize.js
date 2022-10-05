async function main() {
  const vaultAddress = '0x2B33fAc8C11619eB15bBE193Ec2675E505e2829e';
  const strategyAddress = '0x01BA05560C5Bc1ae3d90987950Aa54A122435166';

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
