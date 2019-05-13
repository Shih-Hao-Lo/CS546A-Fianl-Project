const doctors = require('./doctors');
const medicines = require('./medicines');
const rooms = require('./rooms');
const users = require('./users');
const doctorf = require('../data/doctors');
const medf = require('../data/medicines');
const roomf = require('../data/rooms');
const userf = require('../data/users');

const dbConnection = require("../data/mongoConnection");

async function main() {
    const db = await dbConnection();
    await db.dropDatabase();
    for (var x = 0; x < doctors.length; x++) {
        var cur = await doctorf.adddoctor(doctors[x].fname, doctors[x].lname, doctors[x].email, doctors[x].password, doctors[x].gender, doctors[x].dob)
        for (var y = 0; y < doctors[x].specialism.length; y++) {
            var cur2 = await doctorf.updatespecialism(cur._id, doctors[x].specialism[y], 'add');
        }
    }

    for(var x = 0 ; x < medicines.length ; x++){
        var cur = await medf.addmedicine(medicines[x].name , medicines[x].price);
    }

    for(var x = 0 ; x < rooms.length ; x++){
        var cur = await roomf.addroom(rooms[x].price , rooms[x].name);
    }

    for(var x = 0 ; x < users.length ; x++){
        var cur = await userf.addUser(users[x].email , users[x].email , users[x].gender , users[x].dob , users[x].fname , users[x].lname , users[x].password);
    }

    await db.serverConfig.close();
}
main();