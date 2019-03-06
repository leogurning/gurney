const db = require('../dbmysql');

module.exports = {
  addcity(uid, {
    cityid, provinceid,
    countrycode, cityname,
    citycode, extfield1,
    extfield2, extfield3,
    extfield4,
  }, cb) {
    if (!cityid || !cityname || !provinceid || !countrycode || !uid) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }

    const data = {
      city_id: cityid,
      province_id: provinceid,
      country_code: countrycode,
      city_code: citycode,
      city_name: cityname,
      city_status: 'STSACT',
      created_by: uid,
      created_date: new Date(),
      changed_by: uid,
      changed_date: new Date(),
      ext_field1: extfield1,
      ext_field2: extfield2,
      ext_field3: extfield3,
      ext_field4: extfield4,
    };
    const query = 'INSERT INTO city SET ?';
    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },
  updatecity(uid, {
    cityid, cityname,
    provinceid, countrycode,
    citycode, status,
    extfield1, extfield2,
    extfield3, extfield4,
  }, cb) {
    if (!status || !cityid || !cityname || !provinceid || !countrycode || !uid) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }

    const data = [{
      province_id: provinceid,
      country_code: countrycode,
      city_code: citycode,
      city_name: cityname,
      city_status: status,
      changed_by: uid,
      changed_date: new Date(),
      ext_field1: extfield1,
      ext_field2: extfield2,
      ext_field3: extfield3,
      ext_field4: extfield4,
    }, cityid];
    const query = 'UPDATE city SET ? WHERE city_id = ?';

    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },
  deletecity(id, cb) {
    if (!id) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    const data = [id];
    const query = 'DELETE FROM city WHERE city_id = ?';

    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },
  getcity(id, cb) {
    if (!id) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    // find the user
    const query = 'SELECT * FROM city WHERE city_id = ?';
    const qparams = [id];
    db.find(query, qparams, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (result[0]) {
        cb(null, result[0]);
      } else {
        cb('No city data found.', null);
      }
    });
  },
  listaggcity({
    pname, cname, status,
    limit, page, sortby, sorttype,
  }, cb) {
    let whereclause;
    const qparams = [];

    const offset = (page - 1) * limit;

    whereclause = 'WHERE 1 ';

    if (cname) {
      whereclause += 'AND city_name LIKE ? ';
      qparams.push(`%${cname}%`);
    }

    if (pname) {
      whereclause += 'AND province_name LIKE ? ';
      qparams.push(`%${pname}%`);
    }

    if (status) {
      whereclause += 'AND city_status = ? ';
      qparams.push(status);
    }
    const query = `SELECT city_id, 
                      A.province_name, 
                      B.config_name AS country, 
                      city_code, 
                      city_name,
                      C.config_name AS status, 
                      T.ext_field1, 
                      T.ext_field2, 
                      T.ext_field3, 
                      T.ext_field4 
                  FROM city AS T 
                  LEFT JOIN province AS A ON T.province_id = A.province_id 
                      AND A.province_status = 'STSACT' 
                  LEFT JOIN config AS B ON T.country_code = B.config_code 
                      AND B.group_code = 'CNTYCD' 
                      AND B.config_status = 'STSACT' 
                  LEFT JOIN config AS C ON T.city_status = C.config_code 
                      AND C.group_code = 'STSENT' 
                      AND C.config_status = 'STSACT' 
                      ${whereclause} ORDER BY ${sortby} ${sorttype}`;

    db.findwPagination(query, qparams, offset, limit, (err, results, numPages, numRows) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
      } else {
        cb(null, results, numPages, numRows);
      }
    });
  },
  getaggcity(id, cb) {
    if (!id) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }

    const query = `SELECT city_id, 
                  A.province_name, 
                  B.config_name AS country, 
                  city_code, 
                  city_name,
                  C.config_name AS status,
                  T.created_by, 
                  T.created_date, 
                  T.changed_by, 
                  T.changed_date, 
                  T.ext_field1, 
                  T.ext_field2, 
                  T.ext_field3, 
                  T.ext_field4 
              FROM city AS T 
              LEFT JOIN province AS A ON T.province_id = A.province_id 
                  AND A.province_status = 'STSACT' 
              LEFT JOIN config AS B ON T.country_code = B.config_code 
                  AND B.group_code = 'CNTYCD' 
                  AND B.config_status = 'STSACT' 
              LEFT JOIN config AS C ON T.city_status = C.config_code 
                  AND C.group_code = 'STSENT' 
                  AND C.config_status = 'STSACT' 
              WHERE city_id = ?`;

    const qparams = [id];

    db.find(query, qparams, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (result[0]) {
        cb(null, result[0]);
      } else {
        cb('No city data found.', null);
      }
    });
  },
  listactivecity(id, cname, cb) {
    if (!id) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    const query = `SELECT city_id, 
                          city_name
                  FROM city
                  WHERE city_name LIKE ? 
                      AND province_id = ?
                      AND city_status = ? 
                  ORDER BY city_name ASC 
                  LIMIT 100`;

    const qparams = [`%${cname}%`, id, 'STSACT'];

    db.find(query, qparams, (err, results) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (results[0]) {
        cb(null, results);
      } else {
        cb('No city data found.', null);
      }
    });
  },
};
