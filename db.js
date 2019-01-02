const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const url = 'mongodb://localhost:27017'
const dbName = 'blogs'
const db = module.exports = {}
var mdb

db.open = async function () {
  db.client = await MongoClient.connect(url)
  db.url = url
  db.dbName = dbName
  db.db = mdb = await db.client.db(dbName)

  return mdb
}

db.table = function (tableName) {
  return mdb.collection(tableName)
}

db.close = async function () {
  return db.client.close()
}

db.insert = async function (tableName, record) {
  const table = db.table(tableName)
  if (record.time == null) record.time = new Date()
  let result = await table.insertOne(record)
  return result
}

db.delete = async function (tableName, id) {
  const table = db.table(tableName)
  let result = await table.remove({_id: new mongodb.ObjectID(id)})
  return result
}

db.findOne = async function (tableName, id) {
  const table = db.table(tableName)
  let result = await table.findOne({_id: new mongodb.ObjectID(id)})
  return result
}

db.findUser = async function (tableName, user) {
  const table = db.table(tableName)
  let result = await table.findOne({'account': user})
  return result
}

db.find = async function (tableName) {
  const table = db.table(tableName)
  let result = await table.find({}).toArray()
  return result
}

db.update = async function (tableName, id, profile) {
  const table = db.table(tableName)
  let result = await table.update({_id: new mongodb.ObjectID(id)}, profile)
  return result
}

db.search = async function (tableName, index) {
  const table = db.table(tableName)
  let result = await table.find(index).toArray()
  return result
}
