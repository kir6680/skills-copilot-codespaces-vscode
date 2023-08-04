// Create web server
// Load modules
// Load express
const express = require('express');
// Load body-parser
const bodyParser = require('body-parser');
// Load express-session
const session = require('express-session');
// Load cookie-parser
const cookieParser = require('cookie-parser');
// Load express-validator
const expressValidator = require('express-validator');
// Load express-flash
const flash = require('express-flash');
// Load path
const path = require('path');
// Load mongoose
const mongoose = require('mongoose');
// Load passport
const passport = require('passport');
// Load express-messages
const expressMessages = require('express-messages');
// Load MongoStore
const MongoStore = require('connect-mongo')(session);
// Load multer
const multer = require('multer');
// Load GridFsStorage
const GridFsStorage = require('multer-gridfs-storage');
// Load Grid
const Grid = require('gridfs-stream');
// Load method-override
const methodOverride = require('method-override');
// Load config
const config = require('./config/database');

// Init app
const app = express();

// Init server
const server = require('http').Server(app);

// Init io
const io = require('socket.io')(server);

// Connect to database
mongoose.connect(config.database);

// Init gfs
let gfs;

// Init conn
const conn = mongoose.connection;

// Init grid stream
Grid.mongo = mongoose.mongo;

// Init gfs
conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: config.database,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      // Check file type
      if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        // Set filename
        const filename = `${Date.now()}-${file.originalname}`;
        // Set file info
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        // Resolve promise
        resolve(fileInfo);
      } else {
        // Reject promise
        reject({
          message: 'Invalid file type'
        });
      }
    });
  }
});

// Init upload
const upload = multer({
  storage: storage
});

// Init port
const port