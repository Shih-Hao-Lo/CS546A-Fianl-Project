const patientData = require("./patient");
const doctorData = require("./doctor");
const roomData = require('./room');
const medicineData = require('./medicine');
const reservationData = require('./reservation');
const prescriptionData = require('./prescription');

module.exports = {
    patient: patientData,
    doctor: doctorData,
    room: roomData,
    medicine: medicineData,
    reservation: reservationData,
    prescription: prescriptionData
};