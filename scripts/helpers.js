/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unsupported-features/es-syntax */

// Possible improvement: have the deployment scripts write 
// the vault and strategy addresses in a file, and use those here
module.exports.getTools = async () => {
    const vaultAddress = '0x64da5E89b347aD033615AFcC5A585Db3f38A1ae2';
    const strategyAddress = '0x396Be32F26c98dD6C6Cc813eaaF59C6C3e1101d5';
    const wantAddress = '0x98dc12979A34EE2F7099B1cBD65f9080c5a3284F';
    const Strategy = await ethers.getContractFactory('ReaperStrategyVelodrome');
  
    const [deployer] = await ethers.getSigners();
    const Vault = await ethers.getContractFactory('ReaperVaultv1_4');
    const Erc20 = await ethers.getContractFactory('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20');
    const vault = Vault.attach(vaultAddress);
    const strategy = Strategy.attach(strategyAddress);
    const want = await Erc20.attach(wantAddress);
  
    return {
      deployer: deployer,
      vault: vault,
      strategy: strategy,
      want: want
    };
  };
  