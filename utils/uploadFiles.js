const multer = require("multer");
const path = require("path");
const { escape } = require("querystring");
const cloudinary = require("cloudinary").v2;
const memoryStorage = multer.memoryStorage();

const diskStorage = multer.diskStorage({
  // since we are using cloudinary for our file storage we don't need server destination to use.

  // destination: function (req, file, cb) {
  //   cb(null, `${path.join(__dirname, "../uploads")}`);
  // },

  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Error : Image only ", false);
  }
};

const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 }, // limit the file to 10mb
});

exports.upload = upload;

exports.uploadCloudinary = function (buffer, folder) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      })
      .end(buffer);
  });
};
