const cloudinary = require('cloudinary');
const config = require('../config');

// const uploadpath = "kaxet/images/genres/";
cloudinary.config({
  cloud_name: config.cloud_name,
  api_key: config.api_key,
  api_secret: config.api_secret,
});

module.exports = {
  inputfileupload(uploadpath, file, cb) {
    const d = new Date();
    const ts = (`0${d.getDate()}`).slice(-2) + (`0${d.getMonth() + 1}`).slice(-2)
                    + d.getFullYear() + (`0${d.getHours()}`).slice(-2)
                    + (`0${d.getMinutes()}`).slice(-2) + (`0${d.getSeconds()}`).slice(-2);

    if (!uploadpath) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    if (file) {
      const oriname = file.name;
      const filename = `_file${oriname.substr(oriname.length - 4)}`;
      const name = ts + filename;

      cloudinary.v2.uploader.upload_stream(
        {
          public_id: name, folder: uploadpath, invalidate: true, resource_type: 'raw',
        },
        (err, result) => {
          if (err) {
            cb(`Input File Upload Failed. Error: ${err}`, null);
          } else {
            cb(null, result);
          }
        },
      ).end(file.data);
    } else {
      cb('No File selected !', null);
    }
  },
  inputfiledelete(uploadpath, filename, cb) {
    if (!uploadpath || !filename) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    if (filename) {
      cloudinary.v2.uploader.destroy(filename,
        { invalidate: true, resource_type: 'raw' },
        (err, result) => {
          if (err) {
            cb(`Delete Input file Failed. Error: ${err}`, null);
          } else {
            cb(null, result);
          }
        });
    } else {
      cb('No File selected !', null);
    }
  },
};
