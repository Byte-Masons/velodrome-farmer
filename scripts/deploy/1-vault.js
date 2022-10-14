async function main() {
  const Vault = await ethers.getContractFactory('ReaperVaultv1_4');

  const wantAddress = '0x08Da5205e832a2d2c5d88153e2ec1d176e0aAb06';
  const tokenName = 'Velodrome vAMM-OATH/USDC Crypt';
  const tokenSymbol = 'rfvAMM-OATH/USDC';
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
