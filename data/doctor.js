const mongoCollections = require("./mongoCollections");
const connection = require("./mongoConnection");
const doctor = mongoCollections.doctor;
const ObjectID = require('mongodb').ObjectID;

// Find doctor by id. id is a string or objectid.
async function getbyid(id){
    if(id === undefined){
        throw 'input is empty';
    }
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/doctor.getbyid)'
        }
    }

    const doctorCollections = await doctor();
    const target = await doctorCollections.findOne({ _id: id });
    if(target === null) throw 'Data not found!';

    return target;
}

// Return all doctors in database.
async function getAll(){
    const doctorCollections = await doctor();
    const targets = await doctorCollections.find({}).toArray();
    return targets;
}

// Add new doctor. newname, newusrename and newpasswprd are String.
async function adddoctor(newname , newusername , newpassword){
    const doctorCollections = await doctor();
    const data = {
        name: newname,
        specialism: [],
        schedule: [],
        username: newusername,
        password: newpassword
    }

    const Insertinfo = await doctorCollections.insertOne(data);
    if(Insertinfo.insertedCount === 0) throw 'Insert fail!';

    return await this.getbyid(Insertinfo.insertedId);
}

// Update specialism. id is string or objectid. newspecialsm is string. action is 'add' or 'del'.
async function updatespecialism(id , newspecialism , action){
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/doctor.getbyid)'
        }
    }
    const doctorCollections = await doctor();
    var updatedata = null;
    if(action === 'add'){
        updatedata = await doctorCollections.update({ _id: id } , { $addToSet: { specialism: newspecialism } });
        if(updatedata.modifiedCount === 0) throw 'Update fail!';
    }
    else if(action === 'del'){
        updatedata = await doctorCollections.update({ _id: id } , { $pull: { specialism: newspecialism } });
        if(updatedata.modifiedCount === 0) throw 'Update fail!';
    }

    return await this.getbyid(id);
}

// Update schedule. id is string or objectid. newschedule is { week: arr1 , time: arr2 }. 
// action is 'add' or 'del'.
// arr1: ['Mon' , 'Tue' , 'Wed' , 'Thu' , 'Fri' , 'Sat' , 'Sun']
// arr2: ['Morning' , 'Afternoon' , 'Night']
async function updateschedule(id , newschedule , action){
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/doctor.getbyid)'
        }
    }
    const doctorCollections = await doctor();
    var updatedata = null;
    if(action === 'add'){
        updatedata = await doctorCollections.update({ _id: id } , { $addToSet: { schedule: newschedule } });
    }
    else if(action === 'del'){
        updatedata = await doctorCollections.update({ _id: id } , { $pull: { schedule: newschedule } });
    }

    return await this.getbyid(id);
}

// Update doctor information. id is String or Objectid.
// data = {
//     newname: String or undefined,
//     newusername: String or undefined,
//     newpassword: String or undefined
// }
async function updatedoctor(id , data){
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

    const doctorCollections = await doctor();
    const target = await this.getbyid(id);

    if(data.newname === undefined){
        data.newname = target.name;
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
            specialism: target.specialism,
            schedule: target.schedule,
            username: data.newusername,
            password: data.newpassword 
        }
    }

    const updateinfo = await doctorCollections.updateOne({ _id: id } , updatedata);
    if(updateinfo.modifiedCount === 0) throw 'Update fail!';
    return await this.getbyid(id);
}

// Delete a doctor. id is String or Objectid.
async function deldoctor(id){
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

    const doctorCollections = await doctor();
    const target = await this.getbyid(id);
    
    const delinfo = await doctorCollections.removeOne({ _id: id });
    if(delinfo.deletedCount === 0) throw 'Can not delete id: ' + id;

    return target;
}

// Patient sign in. return true if username matches password.
async function doctorsighin(dusername , dpassword){
    const doctorCollections = await doctor();
    const target = await doctorCollections.findOne({ username: dusername });
    if(target === null) throw 'Data not found!';

    if(target.password === dpassword) return true;
    else return false;
}

module.exports = {
    getbyid,
    getAll,
    adddoctor,
    updatespecialism,
    updateschedule,
    updatedoctor,
    deldoctor,
    doctorsighin
}