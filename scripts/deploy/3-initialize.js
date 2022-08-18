async function main() {
  const vaultAddress = '0xC7C84d12E350cC9cd81EaB405aAE2d600308C711';
  const strategyAddress = '0x68E53D3e39C7EE5795404c70E51B991aC121c30E';

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
