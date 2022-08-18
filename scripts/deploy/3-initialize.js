async function main() {
  const vaultAddress = '0x9B27db3cc52dA7F6Ca16740a977a349AA09547EF';
  const strategyAddress = '0xd50E831C62E91cAFde34666598A99e4F79683706';

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
