async function main() {
  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');

  const wantAddress = '0x3bBDE95B1ed19F8d76252D0B48854d9EAaEc3ceF';
  const tokenName = 'Velodrome vAMM-TAROT/USDC Crypt';
  const tokenSymbol = 'rfvAMM-TAROT/USDC';
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
