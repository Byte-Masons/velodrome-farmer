async function main() {
  const vaultAddress = '0xea28051EeF9BA3A23f5f5Cc2708481a392d7C0c4';
  const strategyAddress = '0xc8696440176F3ADCfF3ee3d107B737e00a938140';

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
