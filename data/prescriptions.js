const mongoCollections = require("./mongoCollections");
const connection = require("./mongoConnection");
const prescriptions = mongoCollections.prescriptions;
const doctorf = require("./doctors");
const patientf = require("./patient");
const users = require("./users");
// const reservations = require("./reservations");
const medicines = require("./medicines");
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

    const prescriptionCollections = await prescriptions();
    const target = await prescriptionCollections.findOne({ _id: id });
    // if(target === null) throw 'Prescription not found!';
    return await processPrescriptionData(target);

    // return target;
}

async function processPrescriptionData(prescription) {
    if(prescription && prescription.medicine) {
        let medicineList = [];
        for(let i=0; i<prescription.medicine.length; i++) {
            let med = await medicines.getbyid(prescription.medicine[i]);
            med.price = parseInt(med.price).toFixed(2);
            medicineList.push(med);
        }

        prescription["medicineList"] = medicineList;
    }
    return prescription;
}

// Return all prescriptions in database.
async function getAll(){
    const prescriptionCollections = await prescriptions();
    const targets = await prescriptionCollections.find({}).toArray();
    return targets;
}

//Make new prescription. pid: patient._id(String or objectid) ; did: doctor._id(String or objectid)
//medicinelist = [{ medinine._id , amount } , ...]
//date is string
async function addprescription(pid , did , medicinelist, date){
    // console.log("inside prescriptions.addprescription")
    if(pid === undefined || did === undefined){
        throw 'input is empty';
    }
    if(pid.constructor != ObjectID){
        if(ObjectID.isValid(pid)){
            pid = new ObjectID(pid);
        }
        else{
            throw 'Patient Id is invalid!(in data/prescription.getbyid)'
        }
    }    
    if(did.constructor != ObjectID){
        if(ObjectID.isValid(did)){
            did = new ObjectID(did);
        }
        else{
            throw 'Doctor Id is invalid!(in data/prescription.getbyid)'
        }
    }
    const dtarget = await doctorf.getbyid(did).catch(e => { throw e });
    const ptarget = await users.getbyid(pid).catch(e => { throw e });
    // const reservation = await reservations.getbyid(resId).catch(e => { throw e });

    const prescriptionCollections = await prescriptions();
    const data = {
        patientid: pid,
        doctorid: did,
        medicine: medicinelist,
        roomid: date
    }

    const insertinfo = await prescriptionCollections.insertOne(data);
    if(insertinfo.insertedCount === 0) throw 'Insert fail!';

    // console.log("inserted; updating resrevations")
    // await reservations.addPrescriptionToReservation(resId, insertinfo.insertedId);
    // await reservations.updatePrescRoomDiag(resId, insertinfo.insertedId, roomId, diagnosis);
    
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

    const prescriptionCollections = await prescriptions();

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

    const prescriptionCollections = await prescriptions();
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

    const prescriptionCollections = await prescriptions();
    const target = await this.getbyid(id);

    const delinfo = await prescriptionCollections.removeOne({ _id: id});
    if(delinfo.deletedCount === 0) throw 'Can not delete id: ' + id;

    return target;
}

async function updatePrescription(prescId, medicinelist, date) {
    let prescriptionCollection = await prescriptions();
    let modifyInfo = await prescriptionCollection.updateOne({_id: prescId}, {$set: { medicine: medicinelist, date: date }})
    return await getbyid(prescId);
}

module.exports = {
    getbyid,
    getAll,
    addprescription,
    modifyprescription,
    modifymedicine,
    delprescription,
    updatePrescription
}