const nodemailer = require('nodemailer');
const fs = require('fs');
const db = require('../dbmysql');
const config = require('../config');
const Msconfig = require('./msconfig.js');

const smtpTransport = nodemailer.createTransport({
  service: config.email_service,
  auth: {
    type: 'OAuth2',
    user: config.email_userid,
    clientId: config.email_clientid,
    clientSecret: config.email_clientsecret,
    refreshToken: config.email_refresh_token,
    // accessToken: serverConfig.gmail.access_token
  },
});
let mailOptions;
const htmltemplatepath = __dirname.replace('models', 'template-emailnotif');

module.exports = {
  sendemailverification(uid, email, reqProtocol, reqHost, cb) {
    if (!uid || !email || !reqProtocol || !reqHost) {
      cb('Posted data is not correct or incompleted.', null);
    } else {
      const phash = config.createRandomHash(5455588811110019777546, config.secret);
      const data = [{ vhash: phash }, uid];
      const query = 'UPDATE users SET ? WHERE user_id =?';
      const link = `${reqProtocol}://${reqHost}/verify?id=${phash}`;
      db.saveTransactionsWithEmail(query, data, email, link, (erru) => {
        if (erru) {
          cb(`Error processing request ${erru}`, null);
          return;
        }
        cb(null, `Email has been sent to ${email}`);
      });
    }
  },
  sendemailresetpassword(email, reqProtocol, reqHost, cb) {
    if (!email || !reqProtocol || !reqHost) {
      cb('Posted data is not correct or incompleted.', null);
    } else {
      const phash = config.createRandomHash(5455588811110019777546, config.secret);
      const data = [{ vhash: phash },
        email, 'STSUAC'];
      const query = 'UPDATE users SET ? WHERE email =? AND user_status = ?';
      const link = `${reqProtocol}://${reqHost}/resetpwd?id=${phash}`;
      db.saveResetTransactionsWithEmail(query, data, email, link, (erru) => {
        if (erru) {
          cb(`Error processing request ${erru}`, null);
          return;
        }
        cb(null, `Email to Reset has been sent to ${email}`);
      });
    }
  },
  pageverification(hash, cb) {
    const status = 'STSUAC';

    if (!hash) {
      cb('Error processing request. Invalid URL verification ! ', null);
      return;
    }
    // find the user
    const query = 'SELECT user_id, first_name, last_name, email  FROM users WHERE vhash = ? AND user_status = ?';
    const qparams = [hash, status];
    db.find(query, qparams, (err, user) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (user[0]) {
        cb(null, hash);
      } else {
        cb('Error processing. Invalid Reset password request.', null);
      }
    });
  },
  sendverification(emailto, vlink, cb) {
    let configVal = 'N/A';
    const oriemailBody = fs.readFileSync(`${htmltemplatepath}/email-ver.html`).toString();
    const emailBody = oriemailBody.replace(new RegExp('{urlperipikasiimel}', 'g'), vlink);

    Msconfig.getmsconfigvalue('CSEMAL', 'EMAIL', (err, result) => {
      if (err) {
        configVal = 'No cs email config';
      } else {
        configVal = result[0].config_name;
      }
      const rsemailBody = emailBody.replace(new RegExp('{contactno}', 'g'), configVal);
      mailOptions = {
        from: 'admin-gurney',
        to: emailto,
        subject: 'Please confirm your Email account',
        html: rsemailBody,
      };

      smtpTransport.sendMail(mailOptions, (error, response) => {
        if (error) {
          cb(`Fatal error, ${error.message}`, null);
        } else {
          cb(null, response);
        }
      });
    });
  },
  sendresetpassword(emailto, vlink, cb) {
    let configVal = 'N/A';

    const oriemailBody = fs.readFileSync(`${htmltemplatepath}/reset-pwd.html`).toString();
    const emailBody = oriemailBody.replace(new RegExp('{resetpassurl}', 'g'), vlink);

    Msconfig.getmsconfigvalue('CSEMAL', 'EMAIL', (err, result) => {
      if (err) {
        configVal = 'No cs email config';
      } else {
        configVal = result[0].config_name;
      }
      const rsemailBody = emailBody.replace(new RegExp('{contactno}', 'g'), configVal);
      mailOptions = {
        from: 'admin-gurney',
        to: emailto,
        subject: 'GNey Account Reset Password',
        html: rsemailBody,
      };

      smtpTransport.sendMail(mailOptions, (error, response) => {
        if (error) {
          cb(`Fatal error, ${error.message}`, null);
        } else {
          cb(null, response);
        }
      });
    });
  },
  sendwelcomemail(emailto, vlink, userid, cb) {
    let configVal = 'N/A';

    const oriemailBody = fs.readFileSync(`${htmltemplatepath}/welcome-email.html`).toString();
    const emailBody = oriemailBody.replace(new RegExp('{urlhome}', 'g'), vlink);
    const emailBody1 = emailBody.replace(new RegExp('{username}', 'g'), userid);
    const emailBody2 = emailBody1.replace(new RegExp('{email}', 'g'), emailto);

    Msconfig.getmsconfigvalue('CSEMAL', 'EMAIL', (err, result) => {
      if (err) {
        configVal = 'No cs email config';
      } else {
        configVal = result[0].config_name;
      }
      const rsemailBody = emailBody2.replace(new RegExp('{contactno}', 'g'), configVal);
      mailOptions = {
        from: 'admin-gurney',
        to: emailto,
        subject: 'Welcome to Gney',
        html: rsemailBody,
      };

      smtpTransport.sendMail(mailOptions, (error, response) => {
        if (error) {
          cb(`Fatal error, ${error.message}`, null);
        } else {
          cb(null, response);
        }
      });
    });
  },
};
