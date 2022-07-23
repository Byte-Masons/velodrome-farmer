async function main() {
  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');

  const wantAddress = '0x3EEc44e94ee86ce79f34Bb26dc3CdbbEe18d6d17';
  const tokenName = 'Velodrome vAMM-WETH/AELIN Crypt';
  const tokenSymbol = 'rfvAMM-WETH/AELIN';
  const depositFee = 0;
  const tvlCap = ethers.constants.MaxUint256;

  const vault = await Vault.deploy(wantAddress, tokenName, tokenSymbol, depositFee, tvlCap);

  await vault.deployed();
  console.log('Vault deployed to:', vault.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
