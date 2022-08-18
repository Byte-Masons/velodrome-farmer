async function main() {
  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');

  const wantAddress = '0xEc24EB97cEc2F0F6A2D61254990B0f163BbbFe1d';
  const tokenName = 'Velodrome sAMM-sUSD/DAI Crypt';
  const tokenSymbol = 'rfsAMM-sUSD/DAI';
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
