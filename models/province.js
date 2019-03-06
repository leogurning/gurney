const db = require('../dbmysql');

module.exports = {
  addprovince(uid, {
    provincecode, provincename,
    provinceid, countrycode,
    extfield1, extfield2,
    extfield3, extfield4,
  }, cb) {
    if (!provincename || !provinceid || !countrycode || !uid) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }

    const data = {
      province_id: provinceid,
      country_code: countrycode,
      province_code: provincecode,
      province_name: provincename,
      province_status: 'STSACT',
      created_by: uid,
      created_date: new Date(),
      changed_by: uid,
      changed_date: new Date(),
      ext_field1: extfield1,
      ext_field2: extfield2,
      ext_field3: extfield3,
      ext_field4: extfield4,
    };
    const query = 'INSERT INTO province SET ?';
    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },
  updateprovince(uid, {
    provincecode, provincename,
    provinceid, countrycode,
    status, extfield1,
    extfield2, extfield3,
    extfield4,
  }, cb) {
    if (!status || !provincename || !provinceid || !countrycode || !uid) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }

    const data = [{
      country_code: countrycode,
      province_code: provincecode,
      province_name: provincename,
      province_status: status,
      changed_by: uid,
      changed_date: new Date(),
      ext_field1: extfield1,
      ext_field2: extfield2,
      ext_field3: extfield3,
      ext_field4: extfield4,
    }, provinceid];
    const query = 'UPDATE province SET ? WHERE province_id = ?';

    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },
  deleteprovince(id, cb) {
    if (!id) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    const data = [id];
    const query = 'DELETE FROM province WHERE province_id = ?';

    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },
  getprovince(id, cb) {
    if (!id) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    // find the user
    const query = 'SELECT * FROM province WHERE province_id = ?';
    const qparams = [id];
    db.find(query, qparams, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (result[0]) {
        cb(null, result[0]);
      } else {
        cb('No province data found.', null);
      }
    });
  },
  listaggprovince({
    name, status,
    limit, page, sortby, sorttype,
  }, cb) {
    let whereclause;
    const qparams = [];

    const offset = (page - 1) * limit;

    whereclause = 'WHERE 1 ';

    if (name) {
      whereclause += 'AND province_name LIKE ? ';
      qparams.push(`%${name}%`);
    }

    if (status) {
      whereclause += 'AND province_status = ? ';
      qparams.push(status);
    }

    const query = `SELECT T.province_id, 
                      T.province_code,
                      A.config_name AS country, 
                      T.province_name, 
                      B.config_name AS status, 
                      T.created_by, 
                      T.created_date, 
                      T.changed_by, 
                      T.changed_date,
                      T.ext_field1,
                      T.ext_field2,
                      T.ext_field3,
                      T.ext_field4 
                  FROM province as T 
                  LEFT JOIN config AS A ON T.country_code = A.config_code 
                      AND A.group_code = 'CNTYCD' 
                      AND A.config_status = 'STSACT' 
                  LEFT JOIN config AS B ON T.province_status = B.config_code 
                      AND B.group_code = 'STSENT' 
                      AND B.config_status = 'STSACT' 
                ${whereclause} 
                ORDER BY ${sortby} ${sorttype}`;

    db.findwPagination(query, qparams, offset, limit, (err, results, numPages, numRows) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
      } else {
        cb(null, results, numPages, numRows);
      }
    });
  },
  listactiveprovince(code, provincename, cb) {
    if (!code) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    const query = `SELECT province_id, 
                          province_name
                  FROM province
                  WHERE province_name LIKE ? 
                      AND country_code = ?
                      AND province_status = ? 
                  ORDER BY province_name ASC 
                  LIMIT 100`;

    const qparams = [`%${provincename}%`, code, 'STSACT'];

    db.find(query, qparams, (err, results) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (results[0]) {
        cb(null, results);
      } else {
        cb('No province data found.', null);
      }
    });
  },
  getaggprovince(id, cb) {
    if (!id) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    const query = `SELECT T.province_id, 
                      A.config_name AS country,
                      T.province_code, 
                      T.province_name, 
                      B.config_name AS status, 
                      T.created_by, 
                      T.created_date, 
                      T.changed_by, 
                      T.changed_date,
                      T.ext_field1,
                      T.ext_field2,
                      T.ext_field3,
                      T.ext_field4 
                  FROM province as T 
                  LEFT JOIN config AS A ON T.country_code = A.config_code 
                      AND A.group_code = 'CNTYCD' 
                      AND A.config_status = 'STSACT' 
                  LEFT JOIN config AS B ON T.province_status = B.config_code 
                      AND B.group_code = 'STSENT' 
                      AND B.config_status = 'STSACT' 
                  WHERE province_id = ?`;

    const qparams = [id];

    db.find(query, qparams, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (result[0]) {
        cb(null, result[0]);
      } else {
        cb('No province data found.', null);
      }
    });
  },
};
