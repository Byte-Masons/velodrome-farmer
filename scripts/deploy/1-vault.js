async function main() {
  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');

  const wantAddress = '0x6C5019D345Ec05004A7E7B0623A91a0D9B8D590d';
  const tokenName = 'Velodrome sAMM-USDC/DOLA Crypt';
  const tokenSymbol = 'rfsAMM-USDC/DOLA';
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
