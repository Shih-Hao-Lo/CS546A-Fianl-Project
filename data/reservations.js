const mongoCollections = require("./mongoCollections");
const connection = require("./mongoConnection");
const reservations = mongoCollections.reservations;
// const doctorf = require("./doctor");
const patientf = require("./patient");
// const prescriptionf = require("./prescription");
// const roomf = require('./room');
const ObjectID = require('mongodb').ObjectID;
const doctors = require("./doctors");
const users = require("./users");

// Find reservation by id. id is a string or objectid.
async function getbyid(id){
    if(id === undefined){
        throw 'input is empty';
    }
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/reservation.getbyid)'
        }
    }

    const reservationCollections = await reservations();
    const target = await reservationCollections.findOne({ _id: id });
    if(target === null) throw 'Reservation not found!';

    return processReservationData(target);

    return target;
}

// Find reservation by patient._id. pid is a string or objectid.
async function getbypid(pid){
    if(pid === undefined){
        throw 'input is empty';
    }
    if(pid.constructor != ObjectID){
        if(ObjectID.isValid(pid)){
            pid = new ObjectID(pid);
        }
        else{
            throw 'Id is invalid!(in data/reservation.getbypid)'
        }
    }

    const reservationCollections = await reservations();
    const targets = await reservationCollections.find({ patientid: pid }).toArray();
    // no need to throw. patients can have no prior reservation history
    // if(targets.length === 0) throw 'Data not found!';

    targets.forEach(function(ele) {
        processReservationData(ele);
    });

    return targets;
}

async function getByDoctorId(docId){
    if(docId === undefined){
        throw 'input is empty';
    }
    if(docId.constructor != ObjectID){
        if(ObjectID.isValid(docId)){
            docId = new ObjectID(docId);
        }
        else{
            throw 'Id is invalid!(in data/reservation.getByDoctorId)'
        }
    }

    const reservationCollections = await reservations();
    const targets = await reservationCollections.find({ doctorid: docId }).toArray();
    // no need to throw. patients can have no prior reservation history
    // if(targets.length === 0) throw 'Data not found!';

    targets.forEach(function(ele) {
        processReservationData(ele);
    });

    return targets;
}

async function processReservationData(reservation) {
    var doctor = await doctors.getbyid(reservation.doctorid);
    var patient = await users.getbyid(reservation.patientid);
    reservation["doctor"] = doctor;
    reservation["patient"] = patient;
    reservation["date_formatted"] = new Date(reservation.date).toISOString().replace(/T.+/, '');
    // reservation["date_formatted"] = new Date(reservation.date).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    return reservation;
}

// Return all reservations in database.
async function getAll(){
    const reservationCollections = await reservations();
    const targets = await reservationCollections.find({}).toArray();
    return targets;
}

// Make reservation. pid: patient._id(String or objectid). did: doctor._id(String or objectid)
// newdate: { week: arr1 , time: arr2 }.
// arr1: ['Mon' , 'Tue' , 'Wed' , 'Thu' , 'Fri' , 'Sat' , 'Sun']
// arr2: ['Morning' , 'Afternoon' , 'Night']
async function makereservation(pid , did , newdate){
    if(pid === undefined || did === undefined){
        throw 'input is empty';
    }
    if(pid.constructor != ObjectID){
        if(ObjectID.isValid(pid)){
            pid = new ObjectID(pid);
        }
        else{
            throw 'Id is invalid!(in data/reservation.makereservation)'
        }
    }
    if(did.constructor != ObjectID){
        if(ObjectID.isValid(did)){
            did = new ObjectID(did);
        }
        else{
            throw 'Id is invalid!(in data/reservation.makereservation)'
        }
    }

    const dtarget = await doctors.getbyid(did).catch(e => { throw e });
    const ptarget = await users.getbyid(pid).catch(e => { throw e });
    newdate = new Date(newdate);

    const reservationCollections = await reservations();
    const data = {
        patientid: pid,
        doctorid: did,
        date: newdate,
        roomid: '',
        days: 0,
        prescriptionid: '',
        status: 'pending'
    }

    const insertinfo = await reservationCollections.insertOne(data);
    if(insertinfo.insertedCount === 0) throw 'Insert fail!';

    return await this.getbyid(insertinfo.insertedId);
}

// assign prescription. id = reservation._id ; pid = prescription._id(String or objectid)
async function assignprescription(id , pid){
    if(id === undefined || pid === undefined){
        throw 'input is empty';
    }
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/reservation.assignprescription)'
        }
    }

    const ptarget = await prescriptionf.getbyid(pid).catch(e => { throw e });
    const reservationCollections = await reservation();
    const target = await this.getbyid(id).catch(e => { throw e });
    const data = {
        $set:{
            patientid: target.patientid,
            doctorid: target.doctorid,
            date: target.date,
            roomid: target.roomid,
            days: target.days,
            prescriptionid: pid,
            status: target.status
        }

    }

    const updatedata = await reservationCollections.update( { _id: id } , data);
    if(updatedata.modifiedCount === 0) throw 'Update fail!';

    return await this.getbyid(id);
}

// assign room. id = reservation._id(String or objectid) ; 
// rid = room._id(String or objectid) , day is number.
async function assignroom(id , rid , day){
    if(id === undefined){
        throw 'input is empty';
    }
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/reservation.assignroom)'
        }
    }

    const rtarget = await roomf.getbyid(rid).catch(e => { throw e });
    const reservationCollections = await reservation();
    const target = await this.getbyid(id);
    const data = {
        $set:{
            patientid: target.patientid,
            doctorid: target.doctorid,
            date: target.date,
            roomid: rid,
            days: day,
            prescriptionid: target.prescriptionid,
            status: target.status
        }

    }

    const updateinfo = await reservationCollections.update( { _id: id } , data);
    if(updateinfo.modifiedCount === 0) throw 'Update fail!';

    return await this.getbyid(id);
}

// modify reservation data. id: reservation._id(String or objectid)
// data = {
//     did: doctor._id is a string or objectid,
//     newdate: { week: arr1 , time: arr2 }
// }
// arr1: ['Mon' , 'Tue' , 'Wed' , 'Thu' , 'Fri' , 'Sat' , 'Sun']
// arr2: ['Morning' , 'Afternoon' , 'Night']
async function modifyreservation(id , data){
    if(id === undefined || data.did === undefined){
        throw 'input is empty';
    }
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/reservation.modifyreservation)'
        }
    }
    if(data.did.constructor != ObjectID){
        if(ObjectID.isValid(data.did)){
            data.did = new ObjectID(data.did);
        }
        else{
            throw 'Doctor Id is invalid!(in data/reservation.modifyreservation)'
        }
    }

    const dtarget = await doctorf.getbyid(data.did).catch(e => { throw e });
    const reservationCollections = await reservation();
    const target = this.getbyid(id).catch(e => { throw e });

    if(data.did === undefined){
        data.did = target.doctorid;
    }
    if(data.date === undefined){
        data.date = target.date;
    }
    const updatedata = {
        $set:{
            patientid: target.patientid,
            doctorid: data.did,
            date: data.date,
            room: target.room,
            days: target.days,
            prescription: target.prescription,
            status: target.status            
        }
    }

    const updateinfo = await reservationCollections.update({ _id: id } , updatedata);
    if(updateinfo.modifiedCount === 0) throw 'Update fail!';

    return await this.getbyid(id);
}

async function updatePrescRoomDiag(resId, prescId, roomId, diagnosis) {
    if(resId === undefined || prescId === undefined){
        throw 'input is empty';
    }
    if(resId.constructor != ObjectID){
        if(ObjectID.isValid(resId)){
            resId = new ObjectID(resId);
        }
        else{
            throw 'Id is invalid!(in data/reservation.modifyreservation)'
        }
    }
    if(prescId.constructor != ObjectID){
        if(ObjectID.isValid(prescId)){
            prescId = new ObjectID(prescId);
        }
        else{
            throw 'Doctor Id is invalid!(in data/reservation.modifyreservation)'
        }
    }

    const reservationCollections = await reservations();
    const updateinfo = await reservationCollections.update({ _id: resId } , {$set: {prescriptionid:prescId, roomid: roomId, diagnosis: diagnosis}});
    if(updateinfo.modifiedCount === 0) throw 'Update fail!';

    return await this.getbyid(resId);
}

//delete reservation. id: reservation._id(String or objectid)
async function delreservation(id){
    if(id === undefined){
        throw 'input is empty';
    }
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/reservation.delreservation)'
        }
    } 

    const reservationCollections = await reservation();
    const target = this.getbyid(id);

    const delinfo = await reservationCollections.removeOne({ _id: id });
    if(delinfo.deletedCount === 0) throw 'Can not delete id: ' + id;

    return target;
}

//Payment: set status to complete. id: reservation._id(String or objectid)
async function payment(id){
    if(id === undefined){
        throw 'input is empty';
    }
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/reservation.payment)'
        }
    }   

    const reservationCollections = await reservation();
    const target = this.getbyid(id).catch(e => { throw e });
    const updatedata = {
        $set:{
            patientid: target.patientid,
            doctorid: target.doctorid,
            date: target.date,
            room: target.room,
            days: target.days,
            prescription: target.prescription,
            status: 'Completed'           
        }
    }

    const updateinfo = await reservationCollections.update({ _id: id } , updatedata);
    if(updateinfo.modifiedCount === 0) throw 'Update fail!';

    return await this.getbyid(id);
}

async function getReservationList(user){
    if(user.isDoctor) {
        return getByDoctorId(user._id);
    }
    return getbypid(user._id);
}

module.exports = {
    getbyid,
    getbypid,
    getAll,
    makereservation,
    assignprescription,
    assignroom,
    modifyreservation,
    delreservation,
    payment,
    getReservationList,
    updatePrescRoomDiag
}