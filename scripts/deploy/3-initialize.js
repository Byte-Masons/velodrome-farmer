async function main() {
  const vaultAddress = '0x1B4Fd39128B9caDfdfe62fb8C519061D5227D4b9';
  const strategyAddress = '0xc3908989814ec7E1e0cbC261bb613b864F5dB6e3';

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
