const mongoCollections = require("./mongoCollections");
const connection = require("./mongoConnection");
const patient = mongoCollections.patient;
const ObjectID = require('mongodb').ObjectID

async function getbyid(id){
    if(id === undefined){
        throw 'input is empty';
    }
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/animals.get)'
        }
    }

    const patientCollections = await patient();
    const target = await patientCollections.findOne({ _id: id });
    if(target === null) throw 'Animal not found!';

    return target;
}

async function getAll(){
    const animalsCollections = await animals();
    const targets = await animalsCollections.find({}).toArray();
    return targets;
}

async function addpatient(newname , newgender , newdob , newusername , newpassword){
    const patientCollections = await patient();
    let newpatient = {
        name: newname,
        gender: newgender,
        dob: newdob,
        username: newusername,
        password: newpassword
    };

    const InsertInfo = await patientCollections.insertOne(newpatient);
    if(InsertInfo.insertedCount === 0) throw 'Insert fail!';

    return await this.getbyid(InsertInfo.insertedId);
}

async function updatepatient(id , newname , newgender , newdob , newusername , newpassword){
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
            throw 'Id is invalid!(in data/animals.rename)'
        }
    }

    const patientCollections = await patient();
    const target = await this.getbyid(id);

    if(newname === undefined){
        newname = target.name;
    }
    if(newgender === undefined){
        newgender = target.gender;
    }
    if(newdob === undefined){
        newdob = target.dob;
    }
    if(newusername === undefined){
        newusername = target.username;
    }
    if(newpassword === undefined){
        newpassword = target.password;
    }

    let updatedata = {
        $set:{
            _id: id,
            name: newname,
            gender: newgender,
            dob: newdob,
            username: newusername,
            password: newpassword 
        }
    }

    const updateinfo = await patientCollections.updateOne({ _id: id } , updatedata);
    if(updateinfo.modifiedCount === 0) throw 'Update fail!';
    return await this.getbyid(id);
}

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
            throw 'Id is invalid!(in data/animals.remove)'
        }
    }

    const patientCollections = await patient();
    const target = await this.getbyid(id);
    
    const delinfo = await patientCollections.removeOne({ _id: id });
    if(delinfo.deletedCount === 0) throw 'Can not delete id: ' + id;

    return target;
}

module.exports = {
    getbyid,
    getAll,
    addpatient,
    updatepatient,
    delpatient
}