const patientData = require("./patient");
const doctorData = require("./doctor");
const roomData = require('./room');
const medicineData = require('./medicine');

module.exports = {
    patient: patientData,
    doctor: doctorData,
    room: roomData,
    medicine: medicineData
};