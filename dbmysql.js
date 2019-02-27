const mysql = require('mysql');
const config = require('./config');
const emailnotif = require('./models/emailnotif.js');

const sqlpool = mysql.createPool({
  host: config.mysql_host,
  user: config.mysql_user,
  password: config.mysql_password,
  database: config.mysql_db,
  connectionLimit: 10,
  supportBigNumbers: true,
});

exports.save = (query, data, cb) => {
  sqlpool.getConnection((err, connection) => {
    if (err) { cb(err, null); return; }
    // execute the query
    connection.query(query, data, (errq, result) => {
      connection.release();
      if (errq) { cb(errq, null); return; }
      cb(null, result);
    });
  });
};

exports.saveTransactionsWithEmail = (query, data, email, link, cb) => {
  sqlpool.getConnection((err, connection) => {
    if (err) { cb(err, null); return; }
    /* Begin transaction */
    connection.beginTransaction((errt) => {
      if (errt) {
        connection.release();
        cb(errt, null);
        return;
      }
      connection.query(query, data, (errq, resultq) => {
        if (errq) {
          connection.rollback(() => {
            connection.release();
            cb(errq, null);
          });
          return;
        }
        if (resultq.changedRows > 0 || resultq.insertId > 0) {
          emailnotif.sendverification(email, link, (errv) => {
            if (errv) {
              connection.rollback(() => {
                connection.release();
                cb(errv, null);
              });
            } else {
              connection.commit((errf) => {
                if (errf) {
                  connection.rollback(() => {
                    connection.release();
                    cb(errf, null);
                  });
                  return;
                }
                connection.release();
                cb(null, 'Transaction Complete.');
              });
            }
          });
        } else {
          cb('No updated/inserted data.', null);
        }
      });
    });
    /* End transaction */
  });
};

exports.saveResetTransactionsWithEmail = (query, data, email, link, cb) => {
  sqlpool.getConnection((err, connection) => {
    if (err) { cb(err, null); return; }
    /* Begin transaction */
    connection.beginTransaction((errt) => {
      if (errt) {
        connection.release();
        cb(errt, null);
        return;
      }
      connection.query(query, data, (errq, resultq) => {
        if (errq) {
          connection.rollback(() => {
            connection.release();
            cb(errq, null);
          });
          return;
        }
        if (resultq.changedRows > 0) {
          emailnotif.sendresetpassword(email, link, (errv) => {
            if (errv) {
              connection.rollback(() => {
                connection.release();
                cb(errv, null);
              });
            } else {
              connection.commit((errf) => {
                if (errf) {
                  connection.rollback(() => {
                    connection.release();
                    cb(errf, null);
                  });
                  return;
                }
                connection.release();
                cb(null, 'Transaction Complete.');
              });
            }
          });
        } else {
          cb('No data! There is no Active user account linked to the email.', null);
        }
      });
    });
    /* End transaction */
  });
};

exports.saveTransactions2 = (query1, data1, query2, data2, cb) => {
  sqlpool.getConnection((err, connection) => {
    if (err) { cb(err, null); return; }
    /* Begin transaction */
    connection.beginTransaction((errt) => {
      if (errt) {
        connection.release();
        cb(errt, null);
        return;
      }
      connection.query(query1, data1, (errq, resultq) => {
        if (errq) {
          connection.rollback(() => {
            connection.release();
            cb(errq, null);
          });
          return;
        }
        if (resultq.changedRows > 0 || resultq.insertId > 0) {
          connection.query(query2, data2, (errs) => {
            if (errs) {
              connection.rollback(() => {
                connection.release();
                cb(errs, null);
              });
              return;
            }
            connection.commit((errf) => {
              if (errf) {
                connection.rollback(() => {
                  connection.release();
                  cb(errf, null);
                });
                return;
              }
              connection.release();
              cb(null, 'Transaction Complete.');
            });
          });
        } else {
          cb('No updated/inserted data.', null);
        }
      });
    });
    /* End transaction */
  });
};

// Get records
exports.find = (query, queryparams, cb) => {
  sqlpool.getConnection((err, connection) => {
    if (err) { cb(err, null); return; }
    // make the query
    connection.query(query, queryparams, (errq, results) => {
      connection.release();
      if (errq) { cb(errq, null); return; }
      cb(null, results);
    });
  });
};

exports.findwPagination = (query, queryparams, offset, limit, cb) => {
  let numRows; let numPages;
  sqlpool.getConnection((err, connection) => {
    if (err) { cb(err, null); return; }
    // make the query
    connection.query(query, queryparams, (errq, results) => {
      const result = results[0];
      if (errq || !result) {
        connection.release();
        numRows = 0;
        numPages = 0;
        cb(errq, null, numPages, numRows);
      } else {
        numRows = results.length;
        numPages = Math.ceil(numRows / limit);
        const queryLimit = `${query} LIMIT ${offset},${limit}`;
        connection.query(queryLimit, queryparams, (errs, fresults) => {
          connection.release();
          if (errs) { cb(errs, null, numPages, numRows); return; }
          const fresult = fresults[0];
          if (!fresult) {
            cb('Error: Result Error', null, numPages, numRows);
          } else {
            cb(null, fresults, numPages, numRows);
          }
        });
      }
    });
  });
};
