const config = require('../config');
const Emailnotif = require('../models/emailnotif.js');

exports.sendemailverificationRouterHandler = (req, res) => {
  const userid = req.params.id;
  const { emailto } = req.body.emailto;

  const rhost = req.get('host');
  const rprotocol = config.getProtocol(req);

  Emailnotif.sendemailverification(userid, emailto, rprotocol, rhost, (err, result) => {
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

exports.sendemailresetpasswordRouterHandler = (req, res) => {
  const { emailto } = req.body;
  const rhost = req.get('host');
  const rprotocol = config.getProtocol(req);
  Emailnotif.sendemailresetpassword(emailto, rprotocol, rhost, (err, result) => {
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

exports.pageverificationRouterHandler = (req, res) => {
  const hash = req.query.id;

  Emailnotif.pageverification(hash, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        hash: result,
        message: 'Success page verification.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};
