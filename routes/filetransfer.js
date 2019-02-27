const Filetrf = require('../models/filetransfer.js');

exports.inputfileuploadapi = (req, res) => {
  const { uploadpath } = req.body;
  const file = req.files.fileinputsrc;

  Filetrf.inputfileupload(uploadpath, file, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'Input File is successfully uploaded.',
        filedata: { filepath: result.secure_url, filename: result.public_id },
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.inputfiledeleteapi = (req, res) => {
  const { uploadpath, filename } = req.body;

  Filetrf.inputfiledelete(uploadpath, filename, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: result,
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};
