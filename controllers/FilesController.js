// controllers/FilesController.js

const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class FilesController {
  // ... (other methods like postUpload, getShow, getIndex, putPublish, putUnpublish)

  static async getFile(req, res) {
    const fileId = req.params.id;
    const size = parseInt(req.query.size, 10);
    const filesCollection = dbClient.client.db(dbClient.databaseName).collection('files');

    const file = await filesCollection.findOne({ _id: new dbClient.client.ObjectID(fileId) });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (file.type === 'folder') {
      return res.status(400).json({ error: "A folder doesn't have content" });
    }

    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);

    if (!file.isPublic && (!userId || file.userId.toString() !== userId.toString())) {
      return res.status(404).json({ error: 'Not found' });
    }

    let filePath = file.localPath;

    if (file.type === 'image' && size) {
      filePath = path.join(path.dirname(file.localPath), `${size}_${path.basename(file.localPath)}`);
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const mimeType = mime.lookup(file.name) || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    fs.createReadStream(filePath).pipe(res);
  }
}

module.exports = FilesController;

