# Hospital Management System

* Shih-Hao Lo
* Hao-Ping Lin
* Naman Yadav
* Yoseph Borai
* Alessandro Gangemi

## Patient

The patient collection will store patient's data. The patients can log in to the system to modify the information, make reservation and pay.

```
{
    "_id": "5ca2e9e8df864d2c789346d4",
    "name": "Someone Somelastname",
    "gender": "M",
    "dob": "05-15-1990",
    "username": "someone123",
    "password": "somepassword112"
}
```

| Name | Type | Description |
|------|------|-------------|
| _id | ObjectId | A globally unique identifier to represent the patient |
| name | string | Patient's name |
| gender | string | Patient's gender |
| dob | string | Patient's Birthday | 
| username | string | Patient's username for login | 
| password | string | Patient's password for login | 

## Doctor

Doctor collection will store a doctor's data. And allow doctors to make prescription, assign room to patient and update their own information.

```
{
    "_id": "5ca2e9e8df864d2c789346d5",
    "name": "Somedoctor Someotherlastname",
    "specialism": ["Family Medicine" , "Pediatrics"], 
    "schedule": [{ week: "Mon" , time: "Afternoon" } , { week: "Tue" , time: "Night"}],
    "username": "adoctor123",
    "password" "doctor'spassword121"
}
```

| Name | Type | Description |
|------|------|-------------|
| _id | ObjectId | A globally unique identifier to represent the doctor |
| name | String | The name of doctor |
| specialism | Array[String] | An array of specialism for the doctor |
| scheduls   | Array[{String , String}] | An array of doctor's schedule |
| username | String | Doctort's username for login |
| password | String | Doctor's password for login |

## Medicine

Medicine collection is use to store medicine data. Users can add, modify or delete medicine date.

```
{
    "_id:" "5ca2e9e8df864d2c789346d4",
    "name": "Aspirin",
    "price": 10
}
```

| Name | Type | Description |
|------|------|-------------|
| _id | ObjectId | A globally unique identifier to represent the medicine |
| name | String | Name of the medicine |
| price | Number | Unit price of the medicine |

## Room

Room collection stores the room's availability and price. Users can add new room, update price, remove room, check in, check out and find empty room.

```
{
    "_id": "5ca2e9e8df864d2c789346d2",
    "price": 35,
    "available": true  
}
```

| Name | Type | Description |
|------|------|-------------|
| _id | ObjectId | A globally unique identifier to represent the room |
| price | Number | Price per day|
| available | Boolean | Is the room available or not |

## Prescription

Prescription collection is generate by doctor which contains information of the patient's medical need. Can modify patient's _id, doctor's id. And add or remove medicine.

```
{
    "patientid": "5ca2e9e8df864d2c789346d6",
    "doctorid": "5ca2e9e8df864d2c789346d5",
    "medicine": [ { _id: "5ca2e9e8df864d2c789346d4" , amount: 2 } , { _id: "5ca2e9e8df864d2c789346d3" , amount: 4 }],
    "date": "04-03-2019"
}
```

| Name | Type | Description |
|------|------|-------------|
| patientid | ObjectId | A globally unique identifier to represent the patient |
| doctorid | ObjectId | A globally unique identifier to represent the doctor |
| medicine | Array[{ObjectId , Number}] | An array of medicine along with the amount of it |
| date | String | Date the prescription is issued |

## Reservation

Reservation collection stores all the reserve history for the entire hospital. Patient can make, modify, cancel reservation and pay fot hte reservation. Doctor can attach prescription and room innformation to the reservation.

```
{
    "patientid": "5ca2e9e8df864d2c789346d6",
    "doctorid": "5ca2e9e8df864d2c789346d5",
    "date": "04-03-2019",
    "room": "5ca2e9e8df864d2c789346d2",
    "days": 3,
    "prescription": "5ca2e9e8df864d2c789346d1",
    "status": "Pending"   
}
```

|Name|Type|Description|
|----|----|-----------|
|patientid|objectId|A globally unique identifier to represent the patient|
|doctorid|objectId|A globally unique identifier to represent the doctor|
|date|String|Date of reservation|
|room|objectId|A globally unique identifier to represent the room|
|days|Number| Number of days stay in the room|
|prescription|objectId|A globally unique identifier to represent the prescription|
|status|String|Whether patient pay the bill or not|