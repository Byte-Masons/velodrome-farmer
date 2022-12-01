async function main() {
  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');

  const wantAddress = '0x98dc12979A34EE2F7099B1cBD65f9080c5a3284F';
  const tokenName = 'Velodrome vAMM-wstETH/USD+ Crypt';
  const tokenSymbol = 'rfvAMM-wstETH/USD+';
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
