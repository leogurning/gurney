const db = require('../dbmysql');

module.exports = {
  adddistrict(uid, {
    districtid, cityid,
    provinceid, countrycode,
    districtcode, districtname,
    extfield1, extfield2,
    extfield3, extfield4,
  }, cb) {
    if (!districtid || !cityid || !districtname || !provinceid || !countrycode || !uid) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }

    const data = {
      district_id: districtid,
      city_id: cityid,
      province_id: provinceid,
      country_code: countrycode,
      district_code: districtcode,
      district_name: districtname,
      district_status: 'STSACT',
      created_by: uid,
      created_date: new Date(),
      changed_by: uid,
      changed_date: new Date(),
      ext_field1: extfield1,
      ext_field2: extfield2,
      ext_field3: extfield3,
      ext_field4: extfield4,
    };
    const query = 'INSERT INTO district SET ?';
    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },
  updatedistrict(uid, {
    districtid, cityid,
    provinceid, countrycode,
    districtcode, districtname,
    extfield1, extfield2,
    extfield3, extfield4,
    status,
  }, cb) {
    if (!status || !districtid || !cityid || !districtname || !provinceid || !countrycode || !uid) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }

    const data = [{
      city_id: cityid,
      province_id: provinceid,
      country_code: countrycode,
      district_code: districtcode,
      district_name: districtname,
      district_status: status,
      changed_by: uid,
      changed_date: new Date(),
      ext_field1: extfield1,
      ext_field2: extfield2,
      ext_field3: extfield3,
      ext_field4: extfield4,
    }, districtid];

    const query = 'UPDATE district SET ? WHERE district_id = ?';

    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },
  deletedistrict(id, cb) {
    if (!id) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    const data = [id];
    const query = 'DELETE FROM district WHERE district_id = ?';

    db.save(query, data, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      cb(null, result);
    });
  },
  getdistrict(id, cb) {
    if (!id) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    // find the user
    const query = 'SELECT * FROM district WHERE district_id = ?';
    const qparams = [id];
    db.find(query, qparams, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (result[0]) {
        cb(null, result[0]);
      } else {
        cb('No district data found.', null);
      }
    });
  },
  listaggdistrict({
    provincename, cityname,
    districtname, status,
    limit, page, sortby, sorttype,
  }, cb) {
    let whereclause;
    const qparams = [];

    const offset = (page - 1) * limit;

    whereclause = 'WHERE 1 ';

    if (cityname) {
      whereclause += 'AND city_name LIKE ? ';
      qparams.push(`%${cityname}%`);
    }

    if (provincename) {
      whereclause += 'AND province_name LIKE ? ';
      qparams.push(`%${provincename}%`);
    }

    if (districtname) {
      whereclause += 'AND district_name LIKE ? ';
      qparams.push(`%${districtname}%`);
    }

    if (status) {
      whereclause += 'AND district_status = ? ';
      qparams.push(status);
    }

    const query = `SELECT T.district_id, 
                      B.city_name, 
                      A.province_name, 
                      C.config_name AS country, 
                      T.district_code, 
                      T.district_name, 
                      D.config_name AS status, 
                      T.ext_field1, 
                      T.ext_field2, 
                      T.ext_field3, 
                      T.ext_field4 
                  FROM district AS T 
                  LEFT JOIN province AS A ON T.province_id = A.province_id 
                      AND A.province_status = 'STSACT' 
                  LEFT JOIN city AS B ON T.city_id = B.city_id 
                      AND B.city_status = 'STSACT' 
                  LEFT JOIN config AS C ON T.country_code = C.config_code 
                      AND C.group_code = 'CNTYCD' 
                      AND C.config_status = 'STSACT' 
                  LEFT JOIN config AS D ON T.district_status = D.config_code 
                      AND D.group_code = 'STSENT' 
                      AND D.config_status = 'STSACT' 
                      ${whereclause} ORDER BY ${sortby} ${sorttype}`;

    db.findwPagination(query, qparams, offset, limit, (err, results, numPages, numRows) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
      } else {
        cb(null, results, numPages, numRows);
      }
    });
  },
  getaggdistrict(id, cb) {
    if (!id) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }

    const query = `SELECT T.district_id, 
                      B.city_name, 
                      A.province_name, 
                      C.config_name AS country, 
                      T.district_code, 
                      T.district_name, 
                      D.config_name AS status,
                      T.created_by, 
                      T.created_date, 
                      T.changed_by, 
                      T.changed_date, 
                      T.ext_field1, 
                      T.ext_field2, 
                      T.ext_field3, 
                      T.ext_field4 
                  FROM district AS T 
                  LEFT JOIN province AS A ON T.province_id = A.province_id 
                      AND A.province_status = 'STSACT' 
                  LEFT JOIN city AS B ON T.city_id = B.city_id 
                      AND B.city_status = 'STSACT' 
                  LEFT JOIN config AS C ON T.country_code = C.config_code 
                      AND C.group_code = 'CNTYCD' 
                      AND C.config_status = 'STSACT' 
                  LEFT JOIN config AS D ON T.district_status = D.config_code 
                      AND D.group_code = 'STSENT' 
                      AND D.config_status = 'STSACT' 
                  WHERE district_id = ?`;

    const qparams = [id];

    db.find(query, qparams, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (result[0]) {
        cb(null, result[0]);
      } else {
        cb('No district data found.', null);
      }
    });
  },
  listactivedistrict(cid, dname, cb) {
    if (!cid) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }

    const query = `SELECT district_id, 
                          district_name
                  FROM district
                  WHERE district_name LIKE ? 
                      AND city_id = ?
                      AND district_status = ? 
                  ORDER BY district_name ASC 
                  LIMIT 100`;

    const qparams = [`%${dname}%`, cid, 'STSACT'];

    db.find(query, qparams, (err, results) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (results[0]) {
        cb(null, results);
      } else {
        cb('No district data found.', null);
      }
    });
  },
};
