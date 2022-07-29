async function main() {
  const Vault = await ethers.getContractFactory('ReaperVeloZap');

  // const wantAddress = '';
  // const tokenName = '';
  // const tokenSymbol = '';
  // const depositFee = 0;
  // const tvlCap = ethers.constants.MaxUint256;

  const vault = await Vault.deploy(
    '0xa132DAB612dB5cB9fC9Ac426A0Cc215A3423F9c9',
    '0x4200000000000000000000000000000000000006',
  );

  await vault.deployed();
  console.log('Vault deployed to:', vault.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
