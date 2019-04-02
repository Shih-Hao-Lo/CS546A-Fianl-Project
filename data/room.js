const mongoCollections = require("./mongoCollections");
const connection = require("./mongoConnection");
const room = mongoCollections.room;
const ObjectID = require('mongodb').ObjectID;

// Find room by id. id is a string or objectid.
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

    const roomCollections = await room();
    const target = await roomCollections.findOne({ _id: id });
    if(target === null) throw 'Data not found!';

    return target;
}

// Return all rooms in database.
async function getAll(){
    const roomCollections = await room();
    const targets = await roomCollections.find({}).toArray();
    return targets;
}

//Return all rooms available.
async function availableroom(){
    const roomCollections = await room();
    const targets = await roomCollections.find({ available: true }).toArray();
    if(targets.length === 0) throw 'No room available!';
    return targets;
}

//Add new room. price is a Number.
async function addroom(price){
    const roomCollections = await room();
    const data = {
        price: price,
        available: true
    }

    const insertinfo = await roomCollections.insertOne(data);
    if(insertinfo.insertedCount === 0) throw 'Insert fail!';

    return await this.getbyid(insertinfo.insertedId);
}

//Set a room to occupied. id is a String or objectid.
async function checkin(id){
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

    const roomCollections = await room();
    const target = await roomCollections.findOne({ _id: id });
    if(target === null) throw 'Data not found!';
    if(target.available === false) throw 'Room already occupied!';
    const data = {
        $set = {
            _id: id,
            price: target.price,
            available: false  
        }
    }
    const updateinfo = await roomCollections.updateOne({ _id: id } , data);
    if(updateinfo.modifiedCount === 0) throw 'Update fail!';

    return await this.getbyid(id);
}

//Set a room to unoccupied. id is String or objectid
async function checkout(id){
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

    const roomCollections = await room();
    const target = await roomCollections.findOne({ _id: id });
    if(target === null) throw 'Data not found!';
    if(target.available === true) throw 'Room already available!';
    
    const data = {
        $set = {
            _id: id,
            price: target.price,
            available: true  
        }
    }
    const updateinfo = await roomCollections.updateOne({ _id: id } , data);
    if(updateinfo.modifiedCount === 0) throw 'Update fail!';

    return await this.getbyid(id);
}

//Update room price. price is a number.
async function updateroom(id , newprice){
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

    const roomCollections = await room();
    const target = await roomCollections.findOne({ _id: id });
    if(target === null) throw 'Data not found!';

    const data = {
        $set = {
            _id: id,
            price: newprice,
            available: target.available  
        }
    }
    const updateinfo = await roomCollections.updateOne({ _id: id } , data);
    if(updateinfo.modifiedCount === 0) throw 'Update fail!';

    return await this.getbyid(id);
}

module.exports = {
    getAll,
    getbyid,
    checkin,
    checkout,
    updateroom,
    addroom,
    availableroom
}