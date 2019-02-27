const config = require('../config');
const User = require('../models/user.js');

exports.signupTechAdmRouterHandler = (req, res) => {
  const {
    firstname, lastname, email, userid, password,
  } = req.body;

  // REGISTER AS TECHNICAL ADMIN
  User.signupTechAdm({
    firstname, lastname, email, userid, password,
  }, (err, result) => {
    if (err) { return res.status(202).json({ success: false, message: err }); }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'User created successfully. You can now login as Technical Admin.',
      });
    }
    return res.status(201).json({ success: false, message: 'Error result. No result found.' });
  });
};

exports.signupClientUserRouterHandler = (req, res) => {
  const {
    firstname, lastname, role, email, userid, password,
  } = req.body;
  const requestProtocol = config.getProtocol(req);
  const requestHost = req.get('host');

  // REGISTER AS USER CLIENT
  User.signupClientUser({
    firstname, lastname, role, email, userid, password,
  }, requestProtocol, requestHost, (err, result) => {
    if (err) { return res.status(202).json({ success: false, message: err }); }
    if (result) {
      return res.status(200).json({
        success: true,
        data: result,
        message: 'User created successfully. Please verify your email.',
      });
    }
    return res.status(201).json({ success: false, message: 'Error result. Please try again.' });
  });
};

exports.emverificationRouterHandler = (req, res) => {
  const hash = req.query.id;
  // Email verification
  User.emverification(hash, (err, result) => {
    if (err) { return res.status(202).json({ success: false, message: err }); }
    if (result) {
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Email verification completed successfully.',
      });
    }
    return res.status(201).json({ success: false, message: 'Error undefined result. Please try again.' });
  });
};

exports.resetpasswordRouterHandler = (req, res) => {
  const { vhash, password } = req.body;
  // Reset password
  User.resetpassword({ vhash, password }, (err, result) => {
    if (err) { return res.status(202).json({ success: false, message: err }); }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'Password updated successfully.',
      });
    }
    return res.status(201).json({ success: false, message: 'Error undefined result. Please try again.' });
  });
};

exports.loginRouterHandler = (req, res) => {
  const { userid, password } = req.body;
  // Login
  User.login({ userid, password }, (err, result) => {
    if (err) { return res.status(202).json({ success: false, message: err }); }
    if (result) {
      return res.status(200).json({
        success: true,
        message: {
          userid: result.userid,
          firstname: result.firstname,
          lastname: result.lastname,
          photopath: result.photopath,
          usertype: result.usertype,
          usercode: result.usercode,
          balance: result.balance,
          email: result.email,
          ver_email: result.ver_email,
          lastlogin: result.lastlogin,
        },
        token: result.token,
      });
    }
    return res.status(201).json({ success: false, message: 'Error undefined result. Please try again.' });
  });
};

exports.authenticateRouterHandler = (req, res, next) => {
  // check header or url parameters or post parameters for token
  // var token = req.body.token || req.query.token || req.headers['authorization'];
  const token = req.headers.authorization;

  User.authenticate(token, (err, result) => {
    if (err) {
      return res.status(202).json({
        success: false,
        message: err,
        errcode: 'exp-token',
      });
    }
    if (result) {
      req.decoded = result;
      return next();
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
      errcode: 'no-token',
    });
  });
};

exports.getuserDetailsRouterHandler = (req, res) => {
  const userid = req.params.id;
  // find the user
  User.getuserDetails(userid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        data: result,
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.updateUserRouterHandler = (req, res) => {
  const { firstname, lastname, role } = req.body;
  const userid = req.params.id;

  User.updateUser(userid, { firstname, lastname, role }, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'User details updated successfully',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.updatePhotoRouterHandler = (req, res) => {
  const { photopath, photoname } = req.body;
  const userid = req.params.id;

  User.updatePhoto(userid, { photopath, photoname }, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'User photo updated successfully',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.changePhotoRouterHandler = (req, res) => {
  const userid = req.params.id;
  const { uploadpath, photoname } = req.body;
  const file = req.files.fileinputsrc;

  User.changePhoto(userid, { uploadpath, photoname }, file, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      const newphotopath = result.secure_url;
      const newphotoname = result.public_id;
      return res.status(200).json({
        success: true,
        newphotopath,
        newphotoname,
        message: 'User photo updated successfully',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.updatePasswordRouterHandler = (req, res) => {
  const userid = req.params.id;
  const { oldpassword, password } = req.body;

  User.updatePassword(userid, { oldpassword, password }, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'Password updated successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.adduseraddressRouterHandler = (req, res) => {
  const userid = req.params.id;
  const {
    address1, address2, districtid,
    cityid, provinceid, countrycode,
  } = req.body;

  User.adduseraddress(userid, {
    address1,
    address2,
    districtid,
    cityid,
    provinceid,
    countrycode,
  }, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'User address added successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.updateuseraddressRouterHandler = (req, res) => {
  const userid = req.params.id;
  const {
    addressid, address1, address2,
    districtid, cityid, provinceid, countrycode,
    status, addressmail,
  } = req.body;

  User.updateuseraddress(userid, {
    addressid,
    address1,
    address2,
    districtid,
    cityid,
    provinceid,
    countrycode,
    status,
    addressmail,
  }, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'User address updated successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.deleteuseraddressRouterHandler = (req, res) => {
  const userid = req.params.id;
  const { addressid } = req.body;

  User.deleteuseraddress(userid, addressid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'User address deleted successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.getuseraddressRouterHandler = (req, res) => {
  const addressid = req.params.id;

  User.getuseraddress(addressid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        data: {
          user_id: result.user_id,
          address_line_1: result.address_line_1,
          address_line_2: result.address_line_2,
          district_id: result.district_id,
          city_id: result.city_id,
          province_id: result.province_id,
          country_code: result.country_code,
          address_status: result.address_status,
          address_mail: result.address_mail,
        },
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.listagguseraddressRouterHandler = (req, res) => {
  const userid = req.params.id;

  let limit = parseInt(req.query.limit, 10);
  let page = parseInt(req.body.page || req.query.page, 10);
  let sortby = req.body.sortby || req.query.sortby;
  let sorttype = 'DESC';

  if (!limit || limit < 1) {
    limit = 10;
  }

  if (!page || page < 1) {
    page = 1;
  }

  if (!sortby) {
    sortby = 'address_id';
  } else if (sortby.indexOf('-') > -1) {
    sorttype = 'ASC';
    // remove minus sign from query of sortby, mark for ascending sort type
    sortby = sortby.slice(1, sortby.length);
  } else {
    sorttype = 'DESC';
  }

  User.listagguseraddress(userid, {
    limit, page, sortby, sorttype,
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

exports.addusercontactnoRouterHandler = (req, res) => {
  const userid = req.params.id;
  const { contactnotype, contactnovalue } = req.body;

  User.addusercontactno(userid, { contactnotype, contactnovalue }, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'User contact no added successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.updateusercontactnoRouterHandler = (req, res) => {
  const userid = req.params.id;
  const {
    contactnotype, contactnovalue, contactnoid, status,
  } = req.body;

  User.updateusercontactno(userid, {
    contactnotype, contactnovalue, contactnoid, status,
  }, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'User contact no updated successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.deleteusercontactnoRouterHandler = (req, res) => {
  const userid = req.params.id;
  const { contactnoid } = req.body;

  User.deleteusercontactno(userid, contactnoid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'User contact no deleted successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.getusercontactnoRouterHandler = (req, res) => {
  const contactnoid = req.params.id;
  User.getusercontactno(contactnoid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        data: {
          user_id: result.user_id,
          contact_no_type: result.contact_no_type,
          contact_no_value: result.contact_no_value,
          contact_no_status: result.contact_no_status,
        },
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.listaggusercontactnoRouterHandler = (req, res) => {
  const userid = req.params.id;

  let limit = parseInt(req.query.limit, 10);
  let page = parseInt(req.body.page || req.query.page, 10);
  let sortby = req.body.sortby || req.query.sortby;
  let sorttype = 'DESC';

  if (!limit || limit < 1) {
    limit = 10;
  }

  if (!page || page < 1) {
    page = 1;
  }

  if (!sortby) {
    sortby = 'contact_no_id';
  } else if (sortby.indexOf('-') > -1) {
    sorttype = 'ASC';
    // remove minus sign from query of sortby, mark for ascending sort type
    sortby = sortby.slice(1, sortby.length);
  } else {
    sorttype = 'DESC';
  }

  User.listaggusercontactno(userid, {
    limit, page, sortby, sorttype,
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
