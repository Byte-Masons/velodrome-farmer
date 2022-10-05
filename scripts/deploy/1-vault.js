async function main() {
  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');

  const wantAddress = '0x050D6Dbc73F6993A29e1327846117C4F5Fc7D68E';
  const tokenName = 'Velodrome sAMM-jEUR/agEUR Crypt';
  const tokenSymbol = 'rfsAMM-jEUR/agEUR';
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
