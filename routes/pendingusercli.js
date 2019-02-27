const User = require('../models/user.js');
const config = require('../config');

exports.listaggpendingusercliRouterHandler = (req, res) => {
  const { searchinput } = req.body.searchinput;

  let limit = parseInt(req.query.limit, 10);
  let page = parseInt(req.body.page || req.query.page, 10);
  let sortby = req.body.sortby || req.query.sortby;
  let sorttype = 'ASC';

  if (!limit || limit < 1) {
    limit = 10;
  }

  if (!page || page < 1) {
    page = 1;
  }

  if (!sortby) {
    sortby = 'first_name';
  } else if (sortby.indexOf('-') > -1) {
    sorttype = 'DESC';
    // remove minus sign from query of sortby, mark for ascending sort type
    sortby = sortby.slice(1, sortby.length);
  } else {
    sorttype = 'ASC';
  }

  User.listaggpendingusercli({
    searchinput, limit, page, sortby, sorttype,
  }, (err, results, numPages, numRows) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    return res.status(200).json({
      success: true,
      data: results,
      npage: numPages,
      totalcount: numRows,
    });
  });
};

exports.rejectUserRouterHandler = (req, res) => {
  const {
    usercliid, admusercode,
  } = req.body;

  const userid = req.params.id;
  User.rejectUser(userid, {
    usercliid, admusercode,
  }, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        data: result,
        message: 'User has been rejected',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.approveUserRouterHandler = (req, res) => {
  const {
    usercode, usercliid, useremail, admusercode,
  } = req.body;
  const userid = req.params.id;

  // send welcome email link
  const link = `${config.getProtocol(req)}://${req.get('host')}/login`;

  User.approveUser(userid, {
    usercode, usercliid, useremail, admusercode, link,
  }, (err, err1, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      if (err1) {
        return res.status(200).json({
          success: true,
          data: result,
          message: `User approved successfully. Error sending email to ${useremail}`,
        });
      }
      return res.status(200).json({
        success: true,
        data: result,
        message: 'User approved successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};
