async function main() {
  const vaultAddress = '0x132F3f42A55F037680f557a1441C4e8e42A41a41';
  const strategyAddress = '0x2356E1565e39e6b688E1Aa2f367B3C152d8A7Ec9';

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
