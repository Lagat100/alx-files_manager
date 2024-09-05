const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.databaseName = database;
    
    this.client.connect().catch((err) => {
      console.error(`MongoDB connection error: ${err}`);
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.getCollectionCount('users');
  }

  async nbFiles() {
    return this.getCollectionCount('files');
  }

  async getCollectionCount(collectionName) {
    const db = this.client.db(this.databaseName);
    const collection = db.collection(collectionName);
    return collection.countDocuments();
  }
}

const dbClient = new DBClient();
module.exports = dbClient;

