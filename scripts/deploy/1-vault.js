async function main() {
  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');

  const wantAddress = '0x43Ce87A1ad20277b78CAE52C7bCD5FC82A297551';
  const tokenName = 'Velodrome vAMM-WETH/DOLA Crypt';
  const tokenSymbol = 'rfvAMM-WETH/DOLA';
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
