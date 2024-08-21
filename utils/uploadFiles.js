const multer = require("multer");
const path = require("path");

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

module.exports = upload;
