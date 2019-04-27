const mongoCollections = require("./mongoCollections");
const connection = require("./mongoConnection");
const users = mongoCollections.users;
const ObjectID = require('mongodb').ObjectID;
const bcrypt = require("bcrypt");
const saltRounds = 5;

// Find user by id. id is String or ObjectId.
async function getbyid(id){
    if(id === undefined){
        throw 'input is empty';
    }
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/users.getbyid)'
        }
    }

    const userCollections = await users();
    const target = await userCollections.findOne({ _id: id });
    if(target === null) throw 'User not found!';

    return target;
}

async function getUserByUsername(username){
    if(username === undefined){
        throw 'input is empty';
    }

    const userCollections = await users();
    const target = await userCollections.findOne({ username: username });
    if(target === null) throw 'User not found!';

    return target;
}

// Return all patients in database.
async function getAll(){
    const patientCollections = await patient();
    const targets = await patientCollections.find({}).toArray();
    return targets;
}


// Add new patient. newname , newgender , newdob , newusername , newpassword are string.
async function addUser(username, email, gender, dob, fname, lname, password){
    const userCollections = await users();
    const hashpassword = await bcrypt.hash(password, saltRounds);
    let newUser = {
        username: username,
        email: email,
        gender: gender,
        dob: dob,
        fname: fname,
        lname: lname,
        password: hashpassword
    };
    
    const check = await userCollections.findOne({ email: email});
    if(check != undefined) throw 'email already exists.';

    const InsertInfo = await userCollections.insertOne(newUser);
    if(InsertInfo.insertedCount === 0) throw 'Insert fail!';

    return await this.getbyid(InsertInfo.insertedId);
}

// Update patient. id is String or ObjectId.
// data = {
//     newname: String or undefined,
//     newgender: String or undefined,
//     newdob: String or undefined,
//     newusername: String or undefined,
//     newpassword: String or undefined
// }
async function updatepatient(id , data){
    if(id === undefined){
        throw 'input is empty';
    }
    if(id.constructor != ObjectID){
        if(id.constructor != String){
            throw 'Id is not a String!';
        }
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/patient.updatepatient)'
        }
    }

    const patientCollections = await patient();
    const target = await this.getbyid(id);

    if(data.newname === undefined){
        data.newname = target.name;
    }
    if(data.newgender === undefined){
        data.newgender = target.gender;
    }
    if(data.newdob === undefined){
        data.newdob = target.dob;
    }
    if(data.newusername === undefined){
        data.newusername = target.username;
    }
    if(data.newpassword === undefined){
        data.newpassword = target.password;
    }

    let updatedata = {
        $set:{
            _id: id,
            name: data.newname,
            gender: data.newgender,
            dob: data.newdob,
            username: data.newusername,
            password: data.newpassword 
        }
    }

    const updateinfo = await patientCollections.updateOne({ _id: id } , updatedata);
    if(updateinfo.modifiedCount === 0) throw 'Update fail!';
    return await this.getbyid(id);
}

// Delete a patient. id is String or Objectid.
async function delpatient(id){
    if(id === undefined){
        throw 'input is empty';
    }
    if(id.constructor != ObjectID){
        if(id.constructor != String){
            throw 'Id is not a String!';
        }
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/patient.delpaient)'
        }
    }

    const patientCollections = await patient();
    const target = await this.getbyid(id);
    
    const delinfo = await patientCollections.removeOne({ _id: id });
    if(delinfo.deletedCount === 0) throw 'Can not delete id: ' + id;

    return target;
}

// Patient sign in. return true if username matches password.
async function patientsighin(pusername , ppassword){
    const patientCollections = await patient();
    const target = await patientCollections.findOne({ username: pusername });
    if(target === null) throw 'Data not found!';

    if(target.password === ppassword) return true;
    else return false;
}

module.exports = {
    getbyid,
    getAll,
    updatepatient,
    delpatient,
    patientsighin,
    addUser,
    getUserByUsername
}