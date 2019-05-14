const xss = require('xss');
const usersData = require("../data/users");
const doctorData = require("../data/doctors");
const reservationData = require("../data/reservations");
const medicineData = require("../data/medicines");
const roomData = require("../data/rooms");
const prescriptionData = require("../data/prescriptions");
const errorPage = 'error';
const bcrypt = require("bcrypt");
const saltRounds = 5;
const specialismList = require("../data/specialism");
const logger = require('../logger').logger;

const constructorMethod = app => {

  // if user logged in redirect to dashboard page
  app.get("/", logging, loggedIn, (req, res) => {
      res.redirect("/dashboard");
  });

  // signup route for new user
  app.get("/signup", logging, (req, res) => {
    res.render("signup", { title: "MediDesk signup" });
  });

  // signup post handler
  app.post("/signup", logging, async (req, res) => {
    if (!req.body.email || !req.body.password) {
      res.status("400");
      res.send("Invalid details!");
    } else {
      var email = xss(req.body.email);
      var password = xss(req.body.password);
      var fname = xss(req.body.fname);
      var lname = xss(req.body.lname);
      var password = xss(req.body.password);
      var dob = xss(req.body.dob);
      var gender = xss(req.body.gender);

      try {
        var user = await usersData.addUser(email, email, gender, dob, fname, lname, password);
        req.session.user = user;
        res.redirect('/dashboard');
      }
      catch (e) {
        res.render("signup", { title: "MediDesk signup" , error: e });
      }
    }
  });

  // user dashboard page
  app.get('/dashboard', logging, loggedIn, function (req, res) {
    var user = req.session.user;
    var name = `${user.fname} ${user.lname}`;
    if (user.isDoctor) name = `Dr. ${name}`;
    res.render('dashboard', { id: req.session.user.id, user: req.session.user, name: name });
  });

  // login user page
  app.get("/login", logging, (req, res) => {
    if(req.session.user) {
      res.redirect('/dashboard');
    } else {
      res.render("login", { title: "MediDesk login" });
    }
  });

  // login post handler
  app.post("/login", logging, async (req, res) => {
    if (!req.body.email || !req.body.password) {
      res.render('login', { message: "Please enter both email and password" });
    } else {
    
      let email = xss(req.body.email);
      let password = xss(req.body.password);

      var user = await usersData.getUserByUsername(email)
      if (user === undefined) {
        var isdoctor = await doctorData.getDoctorByEmail(email);
        if (isdoctor === null) {
          res.render('login', { hasError: true , message: "Invalid email or password." });
          return;
        }
        if (await bcrypt.compare(password, isdoctor.password)) {
          req.session.user = isdoctor;
          req.session.user["isDoctor"] = true;
        }
      }
      else {
        if (await bcrypt.compare(password, user.password)) {
          req.session.user = user;
        }
      }

      if (!req.session.user) {
        res.render('login', { message: "Invalid email or password." });
      }
      else {
        res.redirect('/dashboard');
      }
    }
  });

  app.get('/doctors/search/:id', logging, async (req, res) => {
    var doctors = await doctorData.searchbyspecialism(xss(req.params.id));
    if (doctors != undefined) {
      res.send(doctors);
    }
  });

  // to check whether email already exists while signup
  app.get('/emailcheck/:id', async (req, res) => {
    var doctor = await doctorData.getDoctorByEmail(req.params.id);
    var patient = await usersData.getUserByUsername(req.params.id);
    res.send(doctor == null && patient == null);
  });

  // logout user
  app.get('/logout', logging, function (req, res) {
    let username = req.session.user ? req.session.user.username : undefined;
    req.session.destroy(function () {
      logger(`User logged out: ${username}`);
    });
    res.redirect('/login');
  });

  // new appointment page
  app.get("/reservation/new", logging, loggedIn, async (req, res) => {
    if (req.session.user.isDoctor != undefined) {
      res.redirect("/dashboard");
      return;
    }
    var doctorList = await doctorData.getAll();
    res.render('reservation_new', { user: req.session.user, doctorList: doctorList, spList: specialismList.List });
  });

  // new appointment form submit handler
  app.post("/reservation/new", logging, loggedIn, async (req, res) => {
    if (req.session.user.isDoctor != undefined) {
      res.redirect("/dashboard");
      return;
    }
    var pid = xss(req.body.id);
    var did = xss(req.body.doctor_id);
    var date = xss(req.body.app_date);
    var reservation = await reservationData.makereservation(pid, did, date);
    res.redirect('/reservation');
  });

  // show all appointments page
  app.get("/reservation", logging, loggedIn, async (req, res) => {
    var reservationList = await reservationData.getReservationList(req.session.user);
    res.render('reservation', { user: req.session.user, reservationList: reservationList });
  });

  // appointment details page
  app.get("/reservation/:id", logging, loggedIn, async (req, res) => {
    var resId = xss(req.params.id);
    var reservation = await reservationData.getbyid(resId);
    var doctorList = await doctorData.getAll();

    if(reservation) {
      if(reservation.patientid.toString() != req.session.user._id.toString() 
        && reservation.doctorid.toString() != req.session.user._id.toString()) {
          reservation = null;
        } else {
          doctorList.forEach(function (ele) {
            if (ele._id.toString() == reservation.doctor._id.toString()) ele["selected"] = true;
          });
        }
      
    }
    res.render('reservation_view', { user: req.session.user, doctorList: doctorList, reservation: reservation });
  });

  // udpate status of an appointment
  app.post('/reservation/:id/status/update', logging, loggedIn, async(req, res) => {
    let resId = xss(req.params.id);
    let newStatus = xss(req.query.newStatus);
    let reservation = await reservationData.updateReservationStatus(resId, newStatus);
    res.sendStatus(200);
  });

  // view appointment invoice
  app.get("/reservation/:id/bill", logging, loggedIn, async (req, res) => {
    var resId = xss(req.params.id);
    var reservation = await reservationData.getbyid(resId);
    let todayDate = new Date().toISOString().replace(/T.+/, '');

    if(reservation && (reservation.patientid.toString() === req.session.user._id.toString()
      || reservation.doctorid.toString() === req.session.user._id.toString())) {
        res.render('reservation_bill', { user: req.session.user, reservation: reservation, rommcost: reservationData.getRoomCost(reservation).toFixed(2), todayDate: todayDate, layout: false });
    } else {
      res.render(errorPage, { title: "Not Found", errorMsg: "It seems you are trying to access an invalid URL", errorCode: 404 });      
    }
    
  });

  // appointment payment
  app.get("/reservation/pay/:id" , logging, loggedIn , async(req , res) =>{
    var target = await reservationData.getbyid(xss(req.params.id));
    if (req.session.user._id != target.patientid) {
      res.sendStatus(403);
      return;
    }
    var updated = await reservationData.payment(req.params.id);
    res.redirect('/reservation/' + req.params.id);
  });

  // delete appointment
  app.get('/reservation/delete/:id' , loggedIn , async (req , res) =>{
    var deleted = await reservationData.delreservation(req.params.id);
    res.redirect('/reservation');
  });

  // edit appointment
  app.post("/reservation/edit", logging, loggedIn, async (req, res) => {
    var pid = xss(req.body.patient_id);
    var did = xss(req.body.doctor_id);
    var rid = xss(req.body.reservation_id);
    var date = xss(req.body.app_date);

    var data = {
      did: did,
      newdate: date
    }
    var reservation = await reservationData.modifyreservation(rid, data);
    res.redirect('/reservation');
  })

  // add prescription page
  app.get("/prescription/add", logging, loggedIn, async (req, res) => {
    var resId = xss(req.query.resId);
    var reservation = await reservationData.getbyid(resId);
    var medicineList = await medicineData.getAll();
    var roomList = await roomData.availableroom();

    if(reservation && req.session.user.isDoctor) {
      let medsPrescribed = (reservation.prescription && reservation.prescription.medicineList) || [];
      let medsIdPrescribed = medsPrescribed.map(x => x._id.toString());
      medicineList.forEach(medicine => {
        let medicineId = medicine._id.toString();
        let ind = medsIdPrescribed.indexOf(medicineId);
        medicine.selected = medsIdPrescribed.includes(medicineId);
      });
  
      roomList.forEach(room => {
        if(room._id.toString() === reservation.roomid.toString()) {
          room.selected = true;
        } else {
          room.selected = false;
        }
      });

      let medicineCost = reservationData.getMedicineCost(reservation);
      let roomCost = reservationData.getRoomCost(reservation);
      let totalCost = (medicineCost + roomCost).toFixed(2);
  
      res.render('doctor/prescription_view', { user: req.session.user, roomList: roomList, 
        reservation: reservation, medicineList: medicineList, title: 'Prescription', medicineCost: medicineCost,
        totalCost: totalCost, roomCost: roomCost });
     

    } else {
       res.render(errorPage, { title: "Not Found", errorMsg: "It seems you are trying to access an invalid URL", errorCode: 404 });
  
    }
  });

  // prescription form submit handler
  app.post("/prescription/add", logging, loggedIn, async (req, res) => {

    let resId = xss(req.body.resId);
    let diagnosis = xss(req.body.diagnosis);
    let medsPrecribed = xss(req.body.medsPrescribed).split(',');
    let roomId = xss(req.body.roomId);

    let days = xss(req.body.days);

    var reservation = await reservationData.getbyid(resId);
    var medicineList = await medicineData.getAll();
    var roomList = await roomData.availableroom();
    let { patientid, doctorid } = reservation;

    medicineList.map(medicine => { 
      let medicineId = medicine._id.toString();
      let ind = medsPrecribed.indexOf(medicineId);
      return ind > -1;
    });

    await reservationData.assignroom(resId, days);
    await reservationData.addprescription(resId, patientid, doctorid, medsPrecribed, diagnosis, roomId, new Date());
    res.render('doctor/prescription_view', { user: req.session.user, roomList: roomList, 
    reservation: reservation, medicineList: medicineList, title: 'Prescription' });
  });

    // ====== Update user's profile ====== //

    // A function used to set the html tag <select> to specific option
    function GenderTool(gender) {
        let genderArr = [];
        if (gender === "male") {
            genderArr.push("selected");
            genderArr.push("");
        }
        else {
            genderArr.push("");
            genderArr.push("selected");
        }
        return genderArr;
    }

    // Retrieve user's profile and show on page
    app.get('/edit-profile', logging, loggedIn, function (req, res) {
        if (req.session.user.isDoctor != undefined) {
            res.redirect("/dashboard");
            return;
        }
        let user = req.session.user;
        let name = `${user.fname} ${user.lname}`;
        if (user.isDoctor) name = `Dr. ${name}`;
        let genderArr = GenderTool(user.gender);
        res.render('edit-profile', { id: req.session.user.id, user: req.session.user, name: name, genderSel1: genderArr[0], genderSel2: genderArr[1] });
    });

    // POST user's new profile
    app.post('/edit-profile', logging, loggedIn, async (req, res) => {
        if (req.session.user.isDoctor != undefined) {
            res.redirect("/dashboard");
            return;
        }
        let user = req.session.user;
        let name = `${user.fname} ${user.lname}`;
        let data = {};
        if (user.isDoctor) name = `Dr. ${name}`;
        data.fname = xss(req.body.fname);
        data.lname = xss(req.body.lname);
        data.gender = xss(req.body.gender);
        data.dob = xss(req.body.dob);
        data.address = xss(req.body.address);

        let genderArr = GenderTool(user.gender);

        if (data.fname == "" && data.lname == "" && data.email == "" && data.gender == "" && data.dob == "") {
            res.status("400");
            res.redirect('/dashboard');
            return;
        }

        try {
            let getUser = await usersData.getUserByUsername(user.email);
            let updatedUser = await usersData.updatepatient(getUser._id, data);
            req.session.user = updatedUser;
            res.redirect('/dashboard');
            return;
        } catch (e) {
            // res.status("400");
            console.log(e);
            res.render('edit-profile', { id: req.session.user.id, user: req.session.user, name: name, status2: "Internal Error, Please Contact the Dev team" });
            return;
        }
    });

    // ====== Update user's password ====== //

    app.get('/change-password', logging, loggedIn, function (req, res) {
        if (req.session.user.isDoctor != undefined) {
            res.redirect("/dashboard");
            return;
        }
        res.render('change-pwd');
        return;
    });

    // POST user's new password
    app.post('/change-password', logging, loggedIn, async (req, res) => {
        if (req.session.user.isDoctor != undefined) {
            res.redirect("/dashboard");
            return;
        }
        let user = req.session.user;
        let data = {};
        let oldPWD = xss(req.body.oldPWD);
        let newPWD = xss(req.body.newPWD);
        if (oldPWD == "") {
            res.render('change-pwd', { status2: "Old Password Incorrect" });
            res.status(400);
            return;
        }
        if (newPWD == "") {
            res.render('change-pwd', { status2: "New Password Cannot be Empty" });
            res.status(400);
            return;
        }
        try {
            let getUser = await usersData.getUserByUsername(user.email);
            let checkPWD = await bcrypt.compare(oldPWD, getUser.password);
            if (!checkPWD) {
                res.render('change-pwd', { status2: "Old Password Incorrect, Please insert again" });
                res.status(400);
                return;
            }
            data.password = newPWD;
            let updatedUser = await usersData.updatepatient(getUser._id, data);
            req.session.user = updatedUser;
            console.log("Password Updated");
            res.redirect('/dashboard');
            return;
        } catch (e) {
            // res.status("400");
            console.log(e);
            res.render('edit-profile', { id: req.session.user.id, user: req.session.user, name: name, status2: "Change Password failed" });
            return;
        }
    });

  app.use("*", (req, res) => {
    res.render(errorPage, { title: "Not Found", errorMsg: "It seems you are trying to access an invalid URL", errorCode: 404 });
  });

  //  ******************* middleware section: start *********************
  
  function logging(req, res, next){
    let authUserString = req.session.user ? '(Authenticated User)' : '(Non-Authenticated User)';
    logger(`${req.method} ${req.originalUrl} ${authUserString}`);
    next();
  }
  function loggedIn(req, res, next) {
    if (req.session.user) {
      next();     //If session exists, proceed to page
    } else {
      var err = new Error("Not logged in!");
      res.redirect("/login");
    }
  }
  function xssClean(req, res, next) {
    let reqBody = req.body;
    for(let key in reqBody) {
      reqBody[key] = xss(reqBody[key]);
    }
    next();
  }
  function requireRole(role) {
    return function (req, res, next) {
      if (req.session.user && req.session.user.role === role) {
        next();
      } else {
        res.send(403);
      }
    }
  }

  //  ******************* middleware section: end *********************

};

module.exports = constructorMethod;
