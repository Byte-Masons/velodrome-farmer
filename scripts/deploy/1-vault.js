async function main() {
  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');

  const wantAddress = '0x6fD5BEe1Ddb4dbBB0b7368B080Ab99b8BA765902';
  const tokenName = 'Velodrome sAMM-alETH/WETH Crypt';
  const tokenSymbol = 'rfsAMM-alETH/WETH';
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
