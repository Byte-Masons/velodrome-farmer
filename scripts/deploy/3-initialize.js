async function main() {
  const vaultAddress = '0xD4544A58bDb7a71A295402B3cbB13D3704083D4d';
  const strategyAddress = '0x4FB4437df127c75790aFDFbd3f0b7B67Fd5C65Ec';

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
