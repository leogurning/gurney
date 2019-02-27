const db = require('../dbmysql');

module.exports = {
  listactiveconfigbygroup(group, cb) {
    const status = 'STSACT';
    const sortby = 'config_name';

    if (!group) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }

    const query = `SELECT config_code, config_name 
                    FROM config 
                    WHERE group_code = ? 
                        AND config_status = ?
                        ORDER BY ${sortby} ASC`;
    const qparams = [group, status];

    db.find(query, qparams, (err, results) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (results[0]) {
        cb(null, results);
      } else {
        cb('No config data found.', null);
      }
    });
  },
  listactivecountries(cb) {
    const group = 'CNTYCD';
    const status = 'STSACT';
    const sortby = 'config_name';
    const selectedCountries = ['ID', 'SG'];

    const query = `SELECT config_code, config_name 
                  FROM config 
                  WHERE group_code = ? 
                      AND config_status = ? 
                      AND config_code IN (?)
                      ORDER BY ${sortby} ASC`;

    const qparams = [group, status, selectedCountries];

    db.find(query, qparams, (err, results) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (results[0]) {
        cb(null, results);
      } else {
        cb('No config data found.', null);
      }
    });
  },
  getmsconfigvalue(code, group, cb) {
    const status = 'STSACT';

    if (!code || !group) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }

    const query = `SELECT config_code, config_name 
                  FROM config 
                  WHERE group_code = ? 
                      AND config_status = ? 
                      AND config_code = ?`;

    const qparams = [group, status, code];

    db.find(query, qparams, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (result[0]) {
        cb(null, result);
      } else {
        cb('No config data found.', null);
      }
    });
  },
};
