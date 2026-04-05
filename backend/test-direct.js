require('dotenv').config();
const mongoose = require('mongoose');

const uri1 = 'mongodb://sasidharanit23_db_user:sasidharanit23_db_user@ac-bsocfgq-shard-00-00.309i1go.mongodb.net:27017,ac-bsocfgq-shard-00-01.309i1go.mongodb.net:27017,ac-bsocfgq-shard-00-02.309i1go.mongodb.net:27017/?ssl=true&replicaSet=atlas-6o0yqr-shard-0&authSource=admin&appName=Cluster0';
const uri2 = 'mongodb://sasidharanit23_db_user:sasidharanit23_db_user@ac-bsocfgq-shard-00-00.309i1go.mongodb.net:27017,ac-bsocfgq-shard-00-01.309i1go.mongodb.net:27017,ac-bsocfgq-shard-00-02.309i1go.mongodb.net:27017/?ssl=true&authSource=admin&appName=Cluster0';
const uri3 = 'mongodb://sasidharanit23_db_user:sasidharanit23_db_user@ac-bsocfgq-shard-00-00.309i1go.mongodb.net:27017,ac-bsocfgq-shard-00-01.309i1go.mongodb.net:27017,ac-bsocfgq-shard-00-02.309i1go.mongodb.net:27017/?ssl=true&appName=Cluster0';
const uri4 = 'mongodb://sasidharanit23_db_user:sasidharanit23_db_user@ac-6o0yqr-shard-00-00.309i1go.mongodb.net:27017/?ssl=true&authSource=admin'; // trying just the hash from replicaSet

async function testUri(uri, name) {
  try {
    console.log(`Testing ${name}`);
    await mongoose.connect(uri);
    console.log(`${name} connected successfully!`);
    process.exit(0);
  } catch(e) {
    console.log(`${name} failed:`, e.message);
  }
}

async function run() {
  await testUri(uri1, 'URI 1 (full)');
  await testUri(uri2, 'URI 2 (no replicaSet)');
  await testUri(uri3, 'URI 3 (no authSource)');
  await testUri(uri4, 'URI 4 (alternative hash)');
  process.exit(1);
}

run();
