/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unsupported-features/es-syntax */
const helpers = require('./helpers');

//  NOT IMMUNE TO FAILURE
//  Requires account used to possess the want in its wallet
//  Gas price set to 1000 gwei -> strategist may adjust
//  In case of transaction failing midway through, one may be able 
//  to resume by commenting out the completed steps
//  May be improved substantially:
//      Using nonce managment to handle the failed deposit
//      Refactor functions, use context, to make resuming easier
const main = async () => {
    let tx;
    const options = {gasPrice: 1000000000000, gasLimit: 9000000};
    const {deployer, vault, strategy, want} = await helpers.getTools();
    console.log("Tools set");

    let wantBalance = await want.balanceOf(deployer.address);
    tx = await want.approve(vault.address, wantBalance, options);
    await tx.wait();
    console.log('APPROVED');
    tx = await vault.depositAll(options);
    await tx.wait();
    console.log(`1 - Vault | Deposited ${wantBalance}`);
    await new Promise(resolve => { setTimeout(resolve, 2000); });

    tx = await vault.withdrawAll(options);
    await tx.wait();
    console.log(`2 - Vault | Withdrew everything`);
    await new Promise(resolve => { setTimeout(resolve, 2000); });

    wantBalance = await want.balanceOf(deployer.address);
    tx = await want.approve(vault.address, wantBalance, options);
    await tx.wait();
    console.log('APPROVED');
    tx = await vault.depositAll(options);
    await tx.wait();
    console.log(`3 - Vault | Deposited ${wantBalance}`);
    await new Promise(resolve => { setTimeout(resolve, 2000); });

    tx = await strategy.harvest(options);
    await tx.wait();
    console.log(`4 - Strategy | Harvested`);
    await new Promise(resolve => { setTimeout(resolve, 2000); });

    tx = await strategy.panic(options);
    await tx.wait();
    console.log(`5 - Strategy | Panic!` );
    await new Promise(resolve => { setTimeout(resolve, 2000); });

    tx = await vault.withdrawAll(options)
    await tx.wait();
    console.log(`6 - Vault | Withdrew everything`);
    await new Promise(resolve => { setTimeout(resolve, 2000); });

    wantBalance = await want.balanceOf(deployer.address);
    await want.approve(vault.address, wantBalance, options);
    /// Not included: a failed deposit transaction into the vault
    // try {
    //     tx = await vault.depositAll(options);
    //     await tx.wait();
    //     console.log(`Vault | Wrong place bud, you should not be here`);
    // } catch (error) {
    //     console.log(`Vault | Deposit failed, that's good`);
    // }

    tx = await strategy.unpause(options);
    await tx.wait();
    console.log(`8 - Strategy | Unpaused`);
    await new Promise(resolve => { setTimeout(resolve, 2000); });

    tx = await vault.depositAll(options);
    await tx.wait();
    console.log(`9 - Vault | Deposited`);
    await new Promise(resolve => { setTimeout(resolve, 2000); });
} 

main().then(() => {
    process.exit(0);
}).catch((error) => {
    console.error(error);
    process.exit(1);
})