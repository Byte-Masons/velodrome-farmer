async function main() {
  const vaultAddress = '0x6Cb0cF0518bc8f87B751F178EF264B248d1A2128';
  const strategyAddress = '0x521A34639d8A6C23E257Fcbbb3A748c1d353DfDA';

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
