const mongoCollections = require("./mongoCollections");
const connection = require("./mongoConnection");
const prescription = mongoCollections.prescription;
const doctorf = require("./doctor");
const patientf = require("./patient");
const ObjectID = require('mongodb').ObjectID;

// Find prescription by id. id is a string or objectid.
async function getbyid(id){
    if(id === undefined){
        throw 'input is empty';
    }
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/prescription.getbyid)'
        }
    }

    const prescriptionCollections = await prescription();
    const target = await prescriptionCollections.findOne({ _id: id });
    if(target === null) throw 'Prescription not found!';

    return target;
}

// Return all prescriptions in database.
async function getAll(){
    const prescriptionCollections = await prescription();
    const targets = await prescriptionCollections.find({}).toArray();
    return targets;
}

//Make new prescription. pid: patient._id(String or objectid) ; did: doctor._id(String or objectid)
//medicinelist = [{ medinine._id , amount } , ...]
//date is string
async function addprescription(pid , did , medicinelist , date){
    if(pid === undefined || did === undefined){
        throw 'input is empty';
    }
    if(pid.constructor != ObjectID){
        if(ObjectID.isValid(pid)){
            pid = new ObjectID(pid);
        }
        else{
            throw 'Id is invalid!(in data/prescription.getbyid)'
        }
    }    
    if(did.constructor != ObjectID){
        if(ObjectID.isValid(did)){
            did = new ObjectID(did);
        }
        else{
            throw 'Id is invalid!(in data/prescription.getbyid)'
        }
    }
    const dtarget = await doctorf.getbyid(did).catch(e => { throw e });
    const ptarget = await patientf.getbyid(pid).catch(e => { throw e });

    const prescriptionCollections = await prescription();
    const data = {
        patientid: pid,
        doctorid: did,
        medicine: medicinelist,
        date: date
    }

    const insertinfo = await prescriptionCollections.insertOne(data);
    if(insertinfo.insertedCount === 0) throw 'Insert fail!';

    return await this.getbyid(insertinfo.insertedId);
}

//modify prescription: id: prescription._id
// data = {
//     pid: patient._id (String or objectid or undefined)
//     did: doctorf._id (String or objectid or undefined)
//     newdate: String or undefined
// }
async function modifyprescription(id , data){
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/prescription.modifyprescription)'
        }
    }

    const target = await this.getbyid(id);
    if(data.pid === undefined) data.pid = target.patientid;
    if(data.did === undefined) data.did = target.doctorid;
    if(data.newdate === undefined) data.newdate = target.date;

    const prescriptionCollections = await prescription();

    const modifydata = {
        $set:{
            patientid: data.pid,
            doctorid: data.did,
            medicine: target.medicine,
            date: data.newdate
        }
    }

    const modifyinfo = await prescriptionCollections.update({ _id: id} , modifydata);
    if(modifyinfo.modifiedCount === 0) throw 'Update fail!';

    return await this.getbyid(id);
}

//add or remove medicine. id: prescription._id
//medicinedata = { medicine._id , amount }
//action is 'add' or 'del'.
async function modifymedicine(id , medicinedata , action){
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/prescription.modifymedicine)'
        }
    }

    const prescriptionCollections = await prescription();
    if(action === 'add'){
        var updatedata = await prescriptionCollections.update({ _id: id } , { $addToSet: { medicine: medicinedata } });
        if(updatedata.modifiedCount === 0) throw 'Update fail!';
    }
    else if(action === 'del'){
        var updatedata = await prescriptionCollections.update({ _id: id } , { $pull: { medicine: medicinedata } });
        if(updatedata.modifiedCount === 0) throw 'Update fail!';
    }

    return await this.getbyid(id);
}

//delete prescription. id: prescription._id
async function delprescription(id){
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/prescription.delprescription)'
        }
    }

    const prescriptionCollections = await prescription();
    const target = await this.getbyid(id);

    const delinfo = await prescriptionCollections.removeOne({ _id: id});
    if(delinfo.deletedCount === 0) throw 'Can not delete id: ' + id;

    return target;
}

module.exports = {
    getbyid,
    getAll,
    addprescription,
    modifyprescription,
    modifymedicine,
    delprescription
}