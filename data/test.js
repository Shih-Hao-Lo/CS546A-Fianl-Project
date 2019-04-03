const patientf = require('./patient');
const connection = require("./mongoConnection");

async function main(){
    //const a = await patientf.updatepatient("5ca2e9e8df864d2c789346d4","hoho4","F").catch(e => console.log(e));
    //const a = await patientf.addpatient("haoping","M","05-15-1980","hlin17","hlin177").catch(e=>{console.log(e)});
    const a = await patientf.delpatient("5ca2ed633eeef232dc615b5d");
    console.log(a);
    const db = await connection();
    await db.serverConfig.close();
}

main();