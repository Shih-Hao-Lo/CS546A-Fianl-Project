const mongoCollections = require("./mongoCollections");
const connection = require("./mongoConnection");
const medicine = mongoCollections.medicine;
const ObjectID = require('mongodb').ObjectID;

// Find medicine by id. id is a string or objectid.
async function getbyid(id){
    if(id === undefined){
        throw 'input is empty';
    }
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/medicine.getbyid)'
        }
    }

    const medicineCollections = await medicine();
    const target = await medicineCollections.findOne({ _id: id });
    if(target === null) throw 'Data not found!';

    return target;
}

// Return all kinds medicine in database.
async function getAll(){
    const medicineCollections = await medicine();
    const targets = await medicineCollections.find({}).toArray();
    return targets;
}

//Add new madicine. newname is String and newprice is number.
async function addmedicine(newname , newprice){
    const medicineCollections = await medicine();
    const data = {
        name: newname,
        price: newprice
    }

    const insertinfo = await medicineCollections.insertOne(data);
    if(insertinfo.insertedCount === 0) throw 'Insert fail!';
    
    return await this.getbyid(insertinfo.insertedId);
}

// Update medicine information. id is String or Objectid.
// data = {
//     newnwme: String or undefined,
//     newprice: String or undefined,
// }
async function updatemedicine(id , data){
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
            throw 'Id is invalid!(in data/medicine.updatemedicine)'
        }
    }

    const medicineCollections = await medicine();
    const target = await this.getbyid(id);

    if(data.newname === undefined){
        data.newname = target.name;
    }
    if(data.price === undefined){
        data.newprice = target.price;
    }

    let updatedata = {
        $set:{
            _id: id,
            name: data.newname,
            price: data.newprice
        }
    }

    const updateinfo = await medicineCollections.updateOne({ _id: id } , updatedata);
    if(updateinfo.modifiedCount === 0) throw 'Update fail!';

    return await this.getbyid(id);
}

async function delmedicine(id){
    if(id === undefined){
        throw 'input is empty';
    }
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/medicine.delmedicine)'
        }
    }    
    
    const medicineCollections = await medicine();
    target = await this.getbyid(id);

    const delinfo = await medicineCollections.removeOne({ _id: id });
    if(delinfo.deletedCount === 0) throw 'Can not delete id: ' + id;

    return target;
}

module.exports = {
    getbyid,
    getAll,
    addmedicine,
    updatemedicine,
    delmedicine
}