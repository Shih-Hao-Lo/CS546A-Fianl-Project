const mongoCollections = require("./mongoCollections");
const connection = require("./mongoConnection");
const reservations = mongoCollections.reservations;
// const doctorf = require("./doctor");
const patientf = require("./patient");
const prescriptions = require("./prescriptions");
// const roomf = require('./room');
const ObjectID = require('mongodb').ObjectID;
const doctors = require("./doctors");
const users = require("./users");
const rooms = require("./rooms");
const numberToWords = require("number-to-words");
const consultationFee = parseInt('50').toFixed(2);

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

    return await processReservationData(target);

    // return target;
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
    const targets = await reservationCollections.find({ patientid: pid }).sort({date: -1}).toArray();
    // no need to throw. patients can have no prior reservation history
    // if(targets.length === 0) throw 'Data not found!';

    for(let i=0; i<targets.length; i++) {
        await processReservationData(targets[i]);
    }

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
    const targets = await reservationCollections.find({ doctorid: docId }).sort({date: -1}).toArray();
    // no need to throw. patients can have no prior reservation history
    // if(targets.length === 0) throw 'Data not found!';

    for(let i=0; i<targets.length; i++) {
        await processReservationData(targets[i]);
    }

    return targets;
}

async function processReservationData(reservation) {
    var doctor = await doctors.getbyid(reservation.doctorid);
    var patient = await users.getbyid(reservation.patientid).catch(e => {throw e});
    reservation["doctor"] = doctor;
    reservation["patient"] = patient;
    reservation["date_formatted"] = new Date(reservation.date).toISOString().replace(/T.+/, '');
    reservation["consultation_fee"] = consultationFee;
    if(reservation.prescriptionid) {
        // console.log("getting prescription data"+reservation.prescriptionid);
        reservation["prescription"] = await prescriptions.getbyid(reservation.prescriptionid);
    }
        

    if(reservation.roomid) {
        // console.log("getting room data: "+reservation.roomid);
        reservation["room"] = await rooms.getbyid(reservation.roomid);
        reservation.room.price = parseInt(reservation.room.price).toFixed(2);
    }
    
    reservation["cost"] = getTotalCost(reservation);
    reservation["cost_in_words"] = capitalizeFirstLetter(numberToWords.toWords(reservation.cost));
    
    console.log(JSON.stringify(reservation, null, 4));
    // reservation["date_formatted"] = new Date(reservation.date).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    return reservation;
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
        status: 'confirmed'
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
    console.log(data);

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

    const dtarget = await doctors.getbyid(data.did).catch(e => { throw e });
    const reservationCollections = await reservations();
    const target = await this.getbyid(id).catch(e => { throw e });

    console.log("target---------------------------\n");
    console.log(target);
    console.log("dtarget----------------------\n");
    console.log(dtarget);

    if(data.did === undefined){
        data.did = target.doctorid;
    }
    if(data.newdate === undefined){
        data.newdate = target.date;
    }
    const updatedata = {
        $set:{
            patientid: target.patientid,
            doctorid: data.did,
            date: data.newdate,
            room: target.room,
            days: target.days,
            prescription: target.prescription,
            status: target.status            
        }
    }
    console.log("updatedata---------------------------\n");
    console.log(updatedata);

    const updateinfo = await reservationCollections.updateOne({ _id: id } , updatedata);
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
        return await getByDoctorId(user._id);
    }
    return await getbypid(user._id);
}

function getTotalCost(reservation) {
    
    let totalCost = 0;
    if(reservation.prescription && reservation.prescription.medicineList) {
        let medList = reservation.prescription.medicineList;
        medList.forEach(function(elem, index) {
            let price = parseInt(elem.price);
            totalCost += price;
        })
    }

    if(reservation.room) {
        totalCost += parseInt(reservation.room.price);
    }

    if(reservation.consultation_fee) {
        totalCost += parseInt(reservation.consultation_fee);
    }

    return totalCost.toFixed(2);
}

async function updateReservationStatus(resId, newStatus) {
    console.log("inside reservations.updateReservationStatus");
    if(resId === undefined || newStatus === undefined) {
        throw 'input is emtpy';
    }
    if(resId.constructor != ObjectID){
        if(ObjectID.isValid(resId)){
            resId = new ObjectID(resId);
        }
        else{
            throw 'Reservation Id is invalid!(in data/reservations.updateReservationStatus)'
        }
    }

    // let reservation = await getbyid(resId);
    let reservationCollection = await reservations();
    let modifiedInfo = await reservationCollection.updateOne({_id: resId}, {$set: {status: newStatus}})
    return await getbyid(resId);
}

async function addprescription(resId, pid , did , medicinelist , diagnosis, roomId, date){
    console.log("inside reservations.addprescription")
    if(pid === undefined || did === undefined || resId === undefined){
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

    let reservation = await getbyid(resId);
    let prescription = reservation.prescriptionid ?
        await prescriptions.updatePrescription(reservation.prescriptionid, medicinelist, date) : 
        await prescriptions.addprescription(pid, did, medicinelist, date);
    // if(!reservation.prescriptionid) {
    //     prescription = await prescriptions.addprescription(pid, did, medicinelist, date);
    // } else {
    //     prescription = await prescriptions.updatePrescription(reservation.prescriptionid, medicinelist, date);
    // }


    
    reservation = await this.updatePrescRoomDiag(resId, prescription._id, roomId, diagnosis);
    
    return reservation;
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
    updatePrescRoomDiag,
    getTotalCost,
    addprescription,
    updateReservationStatus
}