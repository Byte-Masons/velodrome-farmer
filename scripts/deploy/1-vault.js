async function main() {
  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');

  const wantAddress = '0xe75a3f4Bf99882aD9f8aeBAB2115873315425D00';
  const tokenName = 'Velodrome sAMM-USDC/alUSD Crypt';
  const tokenSymbol = 'rfsAMM-USDC/alUSD';
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
