/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unsupported-features/es-syntax */
const helpers = require('./helpers');

// Strat | Run 1st harvest
// Strat | Run 2nd harvest
// Strat | Raise logCadence to 1 hour
// Vault | Remove TVL cap
// Strat | Grant strat admin role to multiSig
// Vault | Transfer vault ownership to multisig
const main = async () => {
    let tx;
    const options = {gasPrice: 1000000000000, gasLimit: 9000000};
    const {vault, strategy} = await helpers.getTools();
    console.log("Tools set");

    const multiSigAddress = '0x111731A388743a75CF60CCA7b140C58e41D83635';
    const adminRole = '0x0000000000000000000000000000000000000000000000000000000000000000';
    tx = await strategy.harvest(options);
    await tx.wait();
    console.log('Strat | 1st harvest OK');
    await new Promise(resolve => { setTimeout(resolve, 61000); });

    tx = await strategy.harvest(options);
    await tx.wait();
    console.log('Strat | 2nd harvest OK');
    await new Promise(resolve => { setTimeout(resolve, 2000); });

    tx = await strategy.updateHarvestLogCadence(3600, options);
    await tx.wait();
    console.log('Strat | harvestLogCadence set to 3600 OK');
    await new Promise(resolve => { setTimeout(resolve, 2000); });

    tx = await vault.removeTvlCap(options);
    await tx.wait();
    console.log('Vault | removeTvlCap OK');
    await new Promise(resolve => { setTimeout(resolve, 2000); });

    tx = await strategy.grantRole(adminRole, multiSigAddress, options);
    await tx.wait();
    console.log(`Strat | grantRole ${adminRole} to ${multiSigAddress} OK`);
    await new Promise(resolve => { setTimeout(resolve, 2000); });

    tx = await vault.transferOwnership(multiSigAddress, options);
    await tx.wait();
    console.log(`Vault | transferOwnership to ${multiSigAddress} OK`);
    await new Promise(resolve => { setTimeout(resolve, 2000); });
}

main().then(() => {
    process.exit(0);
}).catch((error) => {
    console.error(error);
    process.exit(1);
})