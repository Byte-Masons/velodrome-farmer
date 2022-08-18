async function main() {
  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');

  const wantAddress = '0x9C8a59934fbA9aF82674EFf5D13a24e7c7E7A1f1';
  const tokenName = 'Velodrome vAMM-USDC/PERP Crypt';
  const tokenSymbol = 'rfvAMM-USDC/PERP';
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
