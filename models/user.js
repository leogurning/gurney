const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const db = require('../dbmysql');
const config = require('../config');
const filetransfer = require('../models/filetransfer.js');
const emailnotif = require('../models/emailnotif.js');

function comparePassword(candidatePassword, storedPassword, cb) {
  bcrypt.compare(candidatePassword, storedPassword, (err, isMatch) => {
    if (err) { cb(err); return; }

    cb(null, isMatch);
  });
}

module.exports = {

  signupTechAdm({
    firstname, lastname, email, userid, password,
  }, cb) {
    // Check for registration errors

    if (!email || !userid || !password) {
      cb('Posted data is not correct or incomplete.', null);
      return;
    }
    const query = 'SELECT * FROM users WHERE user_id = ? AND user_status <> ?';
    const qparams = [userid, 'STSURJ'];
    db.find(query, qparams, (err, eUser) => {
      if (err) {
        cb(`Error processing request 100 ${err}`, null);
        return;
      }
      // If user is not unique, return error
      if (eUser[0]) {
        cb('Userid already exists.', null);
        return;
      }
      const query1 = 'SELECT * FROM users WHERE email = ? AND user_status <> ?';
      const qparams1 = [email, 'STSURJ'];
      db.find(query1, qparams1, (errq, emUser) => {
        if (errq) {
          cb(`Error processing request 101 ${errq}`, null);
          return;
        }
        // If user is not unique, return error
        if (emUser[0]) {
          cb('Email is already used by other Userid.', null);
          return;
        }
        const SALT_FACTOR = 5;
        bcrypt.genSalt(SALT_FACTOR, (errs, salt) => {
          if (errs) { cb(`Error processing request 102 ${errs}`, null); return; }
          bcrypt.hash(password, salt, null, (errf, hash) => {
            if (errf) { cb(`Error processing request 103 ${errf}`, null); return; }

            const data = {
              user_id: userid,
              email,
              user_password: hash,
              first_name: firstname,
              last_name: lastname,
              user_type: 'USRADT',
              user_status: 'STSUAC',
              ver_email: 'N',
              last_login: new Date(),
            };
            const queryf = 'INSERT INTO users SET ?';
            db.save(queryf, data, (erru, result) => {
              if (erru) { cb(`Error processing request 104 ${erru}`, null); return; }
              cb(null, result);
            });
          });
        });
      });
    });
  },

  signupClientUser({
    firstname, lastname, role, email, userid, password,
  }, reqProtocol, reqHost, cb) {
    let phash; let link;

    if (!email || !userid || !password || !reqProtocol || !reqHost) {
      cb('Posted data is not correct or incomplete.', null);
      return;
    }
    const query = 'SELECT * FROM users WHERE user_id = ? AND user_status <> ?';
    const qparams = [userid, 'STSURJ'];
    db.find(query, qparams, (err, eUser) => {
      if (err) {
        cb(`Error processing request 100 ${err}`, null);
        return;
      }
      // If user is not unique, return error
      if (eUser[0]) {
        cb('Userid already exists.', null);
        return;
      }
      const query1 = 'SELECT * FROM users WHERE email = ? AND user_status <> ?';
      const qparams1 = [email, 'STSURJ'];
      db.find(query1, qparams1, (errq, emUser) => {
        if (errq) {
          cb(`Error processing request 101 ${errq}`, null);
          return;
        }
        // If user is not unique, return error
        if (emUser[0]) {
          cb('Email is already used by other Userid.', null);
          return;
        }
        const SALT_FACTOR = 5;
        bcrypt.genSalt(SALT_FACTOR, (errs, salt) => {
          if (errs) {
            cb(`Error processing request 102 ${errs}`, null);
            return;
          }

          bcrypt.hash(password, salt, null, (errf, hash) => {
            if (errf) {
              cb(`Error processing request 103 ${errf}`, null);
              return;
            }
            // create hash for email confirmation
            phash = config.createRandomHash(5455588811110019777546, config.secret);

            const data = {
              user_id: userid,
              email,
              user_password: hash,
              first_name: firstname,
              last_name: lastname,
              user_type: 'USRCLI',
              user_status: 'STSUPD',
              ver_email: 'N',
              vhash: phash,
              last_login: new Date(),
              ext_field4: role,
            };
            const queryf = 'INSERT INTO users SET ?';
            link = `${reqProtocol}://${reqHost}/verify?id=${phash}`;
            db.saveTransactionsWithEmail(queryf, data, email, link, (erru) => {
              if (erru) {
                cb(`Error processing request 104 ${erru}`, null);
                return;
              }
              const finalresult = {
                userid,
                firstname,
                lastname,
                usertype: 'USRCLI',
                email,
              };
              cb(null, finalresult);
            });
          });
        });
      });
    });
  },

  emverification(hash, cb) {
    const status = ['STSUAC', 'STSUPD'];

    if (!hash) {
      cb('Error processing request. Invalid URL verification ! ', null);
      return;
    }
    // find the user
    const query = 'SELECT user_id, first_name, last_name, email  FROM users WHERE vhash = ? AND user_status IN (?)';
    const qparams = [hash, status];

    db.find(query, qparams, (err, user) => {
      if (err) {
        cb(`Error processing request 100 ${err}`, null);
        return;
      }
      if (user[0]) {
        // update/remove hash value
        const data = [{
          vhash: null,
          ver_email: 'Y',
        }, hash, status];
        const query1 = 'UPDATE users SET ? WHERE vhash = ? AND user_status IN (?)';

        db.save(query1, data, (errq, result) => {
          if (errq) {
            cb(`Error processing request 101 ${errq}`, null);
            return;
          }

          if (result.changedRows > 0) {
            cb(null, user);
          } else {
            cb('UnAuthorised! No updated records.', null);
          }
        });
      } else {
        cb('UnAuthorised! Incorrect/expired link provided OR user status NOT active.', null);
      }
    });
  },

  resetpassword({ vhash, password }, cb) {
    const status = 'STSUAC';

    if (!vhash || !password) {
      cb('Error processing request. Invalid URL verification ! ', null);
      return;
    }
    // update passwd /remove hash value
    const SALT_FACTOR = 5;
    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
      if (err) {
        cb(`Error processing request code 100 ${err}`, null);
        return;
      }

      bcrypt.hash(password, salt, null, (errb, hash) => {
        if (errb) {
          cb(`Error processing request code 101 ${errb}`, null);
          return;
        }
        const data = [{
          user_password: hash,
          vhash: null,
        }, vhash, status];
        const query = 'UPDATE users SET ? WHERE vhash =? AND user_status = ?';
        db.save(query, data, (errq, result) => {
          if (errq) {
            cb(`Error processing request code 102 ${errq}`, null);
            return;
          }
          if (result.changedRows > 0) {
            cb(null, result.changedRows);
          } else {
            cb('UnAuthorised! No updated records.', null);
          }
        });
      });
    });
  },

  login({ userid, password }, cb) {
    if (!userid || !password) {
      cb('Posted data is not correct or incomplete.', null);
      return;
    }
    // find the user
    const query = 'SELECT * FROM users WHERE user_id = ? AND user_status <> ?';
    const qparams = [userid, 'STSURJ'];
    db.find(query, qparams, (err, eUser) => {
      if (err) {
        cb(`Error processing request 100 ${err}`, null);
        return;
      }
      // If user is not unique, return error
      if (eUser[0]) {
        switch (eUser[0].user_status) {
          case 'STSUAC':
            comparePassword(password, eUser[0].user_password, (errc, isMatch) => {
              if (isMatch && !errc) {
                const token = jwt.sign({ data: eUser[0] }, config.secret, { expiresIn: config.tokenexp });
                const lastLogin = eUser[0].last_login;
                const data = [{
                  last_login: new Date(),
                }, userid];
                const query1 = 'UPDATE users SET ? WHERE user_id =?';

                // login success update last login
                db.save(query1, data, (errq) => {
                  if (errq) {
                    cb(`Error processing request 101 ${errq}`, null);
                    return;
                  }

                  const initFirstname = eUser[0].first_name ? eUser[0].first_name : eUser[0].user_id;
                  const loginResult = {
                    userid: eUser[0].user_id,
                    firstname: initFirstname,
                    lastname: eUser[0].last_name,
                    photopath: eUser[0].photo_path,
                    usertype: eUser[0].user_type,
                    usercode: eUser[0].user_code,
                    balance: eUser[0].balance,
                    email: eUser[0].email,
                    ver_email: eUser[0].ver_email,
                    lastlogin: config.convertUTCDateToLocalDate(lastLogin),
                    token,
                  };
                  cb(null, loginResult);
                });
              } else {
                cb('Incorrect login credentials. Invalid password !', null);
              }
            });
            break;
          case 'STSUPD':
            if (eUser[0].ver_email === 'Y') {
              cb('User is NOT active yet. Waiting for activation by our system admin.', null);
            } else {
              cb('User is NOT active yet. Please access your email and confirm your registration.', null);
            }
            break;
          case 'STSUIN':
            cb('User is in SUSPEND / NOT ACTIVE status. Please contact our System Admin.', null);
            break;
          default:
            cb('Unidentified user status. Please contact our System Admin.', null);
            break;
        }
      } else {
        cb('Incorrect login credentials. USER does not exist OR rejected !', null);
      }
    });
  },

  authenticate(token, cb) {
    if (token) {
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          cb('Authenticate token expired, please login again.', null);
          return;
        }
        cb(null, decoded);
      });
    } else {
      cb('Fatal error, Authenticate token not available.', null);
    }
  },

  getuserDetails(id, cb) {
    // find the user
    const query = 'SELECT * FROM users WHERE user_id = ?';
    const qparams = [id];
    db.find(query, qparams, (err, eUser) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (eUser[0]) {
        const userResult = {
          userid: eUser[0].user_id,
          firstname: eUser[0].first_name,
          lastname: eUser[0].last_name,
          usercode: eUser[0].user_code,
          usertype: eUser[0].user_type,
          balance: eUser[0].balance,
          photopath: eUser[0].photo_path,
          photoname: eUser[0].photo_name,
          email: eUser[0].email,
          ver_email: eUser[0].ver_email,
          lastlogin: config.convertUTCDateToLocalDate(eUser[0].last_login),
          role: eUser[0].ext_field4,
        };
        cb(null, userResult);
      } else {
        cb('No user data found.', null);
      }
    });
  },

  updateUser(id, { firstname, lastname, role }, cb) {
    if (!id) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }

    const data = [{
      first_name: firstname,
      last_name: lastname,
      ext_field4: role,
    },
    id];
    const query = 'UPDATE users SET ? WHERE user_id =?';
    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },

  updatePhoto(id, { photopath, photoname }, cb) {
    if (!photopath || !photoname || !id) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }

    const data = [{
      photo_path: photopath,
      photo_name: photoname,
    }, id];

    const query = 'UPDATE users SET ? WHERE user_id =?';
    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },

  changePhoto(id, { uploadpath, photoname }, file, cb) {
    if (!uploadpath || !id) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    if (photoname) {
      filetransfer.inputfiledelete(uploadpath, photoname, (err, result) => {
        if (err) {
          console.log(`Error deleting ${photoname}. Error: ${err}`);
        } else { console.log(`${photoname} is deleted. Result: ${result}`); }
      });
    }

    filetransfer.inputfileupload(uploadpath, file, (err, result) => {
      if (err) {
        cb(`Upload file failed. Error: ${err}`, null);
        return;
      }
      const newphotopath = result.secure_url;
      const newphotoname = result.public_id;
      const data = [{
        photo_path: newphotopath,
        photo_name: newphotoname,
      }, id];
      const query = 'UPDATE users SET ? WHERE user_id =?';
      db.save(query, data, (errf, resultf) => {
        if (errf) {
          cb(`Error processing request ${errf}`, null);
          return;
        }
        if (resultf.changedRows > 0) {
          cb(null, result);
        } else {
          cb('Undefined change photo error !', null);
        }
      });
    });
  },
  updatePassword(id, { oldpassword, password }, cb) {
    if (!oldpassword || !password || !id) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    const query = 'SELECT * FROM users WHERE user_id = ? AND user_status = ?';
    const qparams = [id, 'STSUAC'];
    db.find(query, qparams, (err, user) => {
      if (err) {
        cb(`Error processing request 100 ${err}`, null);
        return;
      }
      if (user[0]) {
        comparePassword(oldpassword, user[0].user_password, (errc, isMatch) => {
          if (isMatch && !errc) {
            const SALT_FACTOR = 5;
            bcrypt.genSalt(SALT_FACTOR, (errb, salt) => {
              if (errb) {
                cb(`Error processing request ${errb}`, null);
                return;
              }

              bcrypt.hash(password, salt, null, (errt, hash) => {
                if (errt) {
                  cb(`Error processing request ${errt}`, null);
                  return;
                }
                const data = [{
                  user_password: hash,
                }, id];
                const queryf = 'UPDATE users SET ? WHERE user_id =?';
                db.save(queryf, data, (errf, result) => {
                  if (errf) {
                    cb(`Error processing request ${errf}`, null);
                    return;
                  }
                  cb(null, result);
                });
              });
            });
          } else {
            cb('Incorrect old password.', null);
          }
        });
      } else {
        cb('Error: No user Active found !', null);
      }
    });
  },

  adduseraddress(id, {
    address1, address2, districtid, cityid,
    provinceid, countrycode,
  }, cb) {
    if (!id || !address1 || !districtid || !cityid || !provinceid || !countrycode) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    const data = {
      user_id: id,
      address_line_1: address1,
      address_line_2: address2,
      district_id: districtid,
      city_id: cityid,
      province_id: provinceid,
      country_code: countrycode,
      address_status: 'STSACT',
      address_mail: 'N',
    };
    const query = 'INSERT INTO user_address SET ?';
    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },

  updateuseraddress(id, {
    addressid, address1, address2, districtid,
    cityid, provinceid, countrycode, status, addressmail,
  }, cb) {
    if (!addressid || !id || !address1 || !districtid || !cityid || !provinceid || !countrycode || !status || !addressmail) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    const data = [{
      address_line_1: address1,
      address_line_2: address2,
      district_id: districtid,
      city_id: cityid,
      province_id: provinceid,
      country_code: countrycode,
      address_status: status,
      address_mail: addressmail,
    }, addressid, id];
    const query = 'UPDATE user_address SET ? WHERE address_id = ? AND user_id = ?';
    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },

  deleteuseraddress(uid, adid, cb) {
    if (!adid || !uid) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    const data = [adid, uid];
    const query = 'DELETE FROM user_address WHERE address_id = ? AND user_id = ?';
    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },

  getuseraddress(adid, cb) {
    if (!adid) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    // find the user
    const query = 'SELECT * FROM user_address WHERE address_id = ?';
    const qparams = [adid];
    db.find(query, qparams, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (result[0]) {
        const uadResult = {
          user_id: result[0].user_id,
          address_line_1: result[0].address_line_1,
          address_line_2: result[0].address_line_2,
          district_id: result[0].district_id,
          city_id: result[0].city_id,
          province_id: result[0].province_id,
          country_code: result[0].country_code,
          address_status: result[0].address_status,
          address_mail: result[0].address_mail,
        };
        cb(null, uadResult);
      } else {
        cb('No user address data found.', null);
      }
    });
  },

  listagguseraddress(uid, {
    limit, page, sortby, sorttype,
  }, cb) {
    const offset = (page - 1) * limit;

    const query = `SELECT address_id, 
                      address_line_1, 
                      address_line_2, 
                      C.district_name, 
                      B.city_name, 
                      A.province_name,
                      E.config_name AS country,
                      D.config_name AS status,
                      address_mail 
              FROM user_address AS T 
              LEFT JOIN province AS A ON T.province_id = A.province_id 
                  AND A.province_status = 'STSACT' 
              LEFT JOIN city AS B ON T.city_id = B.city_id 
                  AND B.city_status = 'STSACT' 
              LEFT JOIN district AS C ON T.district_id = C.district_id 
                  AND C.district_status = 'STSACT' 
              LEFT JOIN config AS D ON T.address_status = D.config_code 
                  AND D.group_code = 'STSENT' 
                  AND D.config_status = 'STSACT' 
              LEFT JOIN config AS E ON T.country_code = E.config_code 
                  AND E.group_code = 'CNTYCD' 
                  AND E.config_status = 'STSACT' 
              WHERE user_id = ? ORDER BY ${sortby} ${sorttype}`;
    const qparams = [uid];

    db.findwPagination(query, qparams, offset, limit, (err, results, numPages, numRows) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
      } else {
        cb(null, results, numPages, numRows);
      }
    });
  },

  addusercontactno(uid, { contactnotype, contactnovalue }, cb) {
    if (!uid || !contactnotype || !contactnovalue) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    const data = {
      user_id: uid,
      contact_no_type: contactnotype,
      contact_no_value: contactnovalue,
      contact_no_status: 'STSACT',
    };
    const query = 'INSERT INTO user_contact_no SET ?';
    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },

  updateusercontactno(uid, {
    contactnotype, contactnovalue, contactnoid, status,
  }, cb) {
    if (!uid || !contactnotype || !contactnovalue || !contactnoid || !status) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    const data = [{
      contact_no_type: contactnotype,
      contact_no_value: contactnovalue,
      contact_no_status: status,
    }, contactnoid, uid];
    const query = 'UPDATE user_contact_no SET ? WHERE contact_no_id = ? AND user_id = ?';
    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },

  deleteusercontactno(uid, cid, cb) {
    if (!cid || !uid) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    const data = [cid, uid];
    const query = 'DELETE FROM user_contact_no WHERE contact_no_id = ? AND user_id = ?';
    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },

  getusercontactno(cid, cb) {
    if (!cid) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    // find the user
    const query = 'SELECT * FROM user_contact_no WHERE contact_no_id = ?';
    const qparams = [cid];
    db.find(query, qparams, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (result[0]) {
        const cnResult = {
          user_id: result[0].user_id,
          contact_no_type: result[0].contact_no_type,
          contact_no_value: result[0].contact_no_value,
          contact_no_status: result[0].contact_no_status,
        };
        cb(null, cnResult);
      } else {
        cb('No user contact data found.', null);
      }
    });
  },

  listaggusercontactno(uid, {
    limit, page, sortby, sorttype,
  }, cb) {
    const offset = (page - 1) * limit;
    const query = `SELECT contact_no_id, 
                      B.config_name AS type, 
                      contact_no_value, 
                      A.config_name AS status
              FROM user_contact_no AS T
              LEFT JOIN config AS A ON T.contact_no_status = A.config_code 
                  AND A.group_code = 'STSENT' 
                  AND A.config_status = 'STSACT' 
              LEFT JOIN config AS B ON T.contact_no_type = B.config_code 
                  AND B.group_code = 'CNCTTP' 
                  AND B.config_status = 'STSACT' 
              WHERE user_id = ? ORDER BY ${sortby} ${sorttype}`;
    const qparams = [uid];

    db.findwPagination(query, qparams, offset, limit, (err, results, numPages, numRows) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
      } else {
        cb(null, results, numPages, numRows);
      }
    });
  },
  listaggpendingusercli({
    searchinput, limit, page, sortby, sorttype,
  }, cb) {
    const offset = (page - 1) * limit;

    const query = `SELECT user_id, 
                    first_name, 
                    last_name, 
                    ver_email
            FROM users  
            WHERE user_status = ? AND user_type = ? AND ver_email = ?
                AND ( user_id LIKE ? OR first_name LIKE ? OR last_name LIKE ?)
            ORDER BY ${sortby} ${sorttype}`;

    const qparams = ['STSUPD', 'USRCLI', 'Y',
      `%${searchinput}%`,
      `%${searchinput}%`,
      `%${searchinput}%`];

    db.findwPagination(query, qparams, offset, limit, (err, results, numPages, numRows) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
      } else {
        cb(null, results, numPages, numRows);
      }
    });
  },
  approveUser(uid, {
    usercode, usercliid, useremail, admusercode, elink,
  }, cb) {
    const status = 'STSUAC';

    if (!uid || !usercode || !usercliid || !admusercode || !useremail) {
      cb('Posted data is not correct or incompleted.', null, null);
    } else {
      const data = [{
        user_code: usercode,
        user_status: status,
      }, usercliid];
      const query = 'UPDATE users SET ? WHERE user_id =?';

      const data1 = {
        log_date: new Date(),
        client_id: admusercode,
        activity_type: 'USRAPV',
        remarks: `Approve user ${usercliid}`,
        activity_status: 'STSSCS',
        performed_by: uid,
      };
      const query1 = 'INSERT INTO activitylogs SET ?';

      db.saveTransactions2(query, data, query1, data1, (error, result) => {
        if (error) {
          cb(`Error processing request ${error}`, null, null);
          return;
        }
        // send welcome email
        emailnotif.sendwelcomemail(useremail, elink, usercliid, (err) => {
          if (err) {
            cb(null, err, result);
          } else {
            cb(null, null, result);
          }
        });
      });
    }
  },
  rejectUser(uid, { usercliid, admusercode }, cb) {
    const status = 'STSURJ';

    if (!uid || !usercliid || !admusercode) {
      cb('Posted data is not correct or incompleted.', null);
    } else {
      const data = [{
        user_status: status,
      },
      usercliid];
      const query = 'UPDATE users SET ? WHERE user_id =?';

      const data1 = {
        log_date: new Date(),
        client_id: admusercode,
        activity_type: 'USRRJCT',
        remarks: `Reject user ${usercliid}`,
        activity_status: 'STSSCS',
        performed_by: uid,
      };
      const query1 = 'INSERT INTO activitylogs SET ?';

      db.saveTransactions2(query, data, query1, data1, (error, result) => {
        if (error) {
          cb(`Error processing request ${error}`, null);
          return;
        }
        cb(null, result);
      });
    }
  },
};
