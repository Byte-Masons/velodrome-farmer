async function main() {
  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');

  const wantAddress = '0xFd7FddFc0A729eCF45fB6B12fA3B71A575E1966F';
  const tokenName = 'Velodrome sAMM-WETH/sETH Crypt';
  const tokenSymbol = 'rfsAMM-WETH/sETH';
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
