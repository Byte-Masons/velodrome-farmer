async function main() {
  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');

  const wantAddress = '0xFFD74EF185989BFF8752c818A53a47FC45388F08';
  const tokenName = 'Velodrome vAMM-VELO/OP Crypt';
  const tokenSymbol = 'rfvAMM-VELO/OP';
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
