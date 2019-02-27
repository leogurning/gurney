const db = require('../dbmysql');

function checkClient(psearch, cb) {
  try {
    // find the client
    const query = 'SELECT client_id, search_string FROM clients WHERE search_string = ?';
    const qparams = [psearch];
    db.find(query, qparams, (err, client) => {
      if (err) { cb(err, null); return; }
      if (client[0]) {
        cb(null, client[0]);
      } else {
        cb(null, 'NF');
      }
    });
  } catch (error) {
    cb(error, null);
  }
}

function checkClientProvisioning(clientid, cb) {
  const status = ['STSUAC', 'STSUPD'];
  try {
    // find the client
    const query = 'SELECT user_id, user_code FROM users WHERE user_code = ? AND user_status IN (?)';
    const qparams = [clientid, status];
    db.find(query, qparams, (err, user) => {
      if (err) { cb(err, null); return; }
      if (user[0]) {
        cb(null, user[0]);
      } else {
        cb(null, 'NF');
      }
    });
  } catch (error) {
    cb(error, null);
  }
}

module.exports = {
  addclient(uid, {
    clientname, address1, address2,
    districtid, cityid, provinceid,
    countrycode, clientemail, contactnumber,
    extfield1, extfield2, extfield3, extfield4,
  }, cb) {
    const clientstatus = 'STSACT';

    if (!clientname || !address1 || !districtid
            || !cityid || !provinceid || !countrycode || !clientemail
            || !contactnumber || !uid) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }

    const searchval = clientname.replace(/\s/g, '');
    const searchstring = searchval.toUpperCase() + districtid;

    checkClient(searchstring, (err, result) => {
      if (err) {
        cb(`Error processing request 100 ${err}`, null);
        return;
      }
      if (result === 'NF') {
        const data = {
          client_name: clientname,
          address_line_1: address1,
          address_line_2: address2,
          district_id: districtid,
          city_id: cityid,
          province_id: provinceid,
          country_code: countrycode,
          client_email: clientemail,
          contact_number: contactnumber,
          client_status: clientstatus,
          search_string: searchstring,
          created_by: uid,
          created_date: new Date(),
          changed_by: uid,
          changed_date: new Date(),
          ext_field1: extfield1,
          ext_field2: extfield2,
          ext_field3: extfield3,
          ext_field4: extfield4,
        };
        const query = 'INSERT INTO clients SET ?';
        db.save(query, data, (errq, resultq) => {
          if (errq) {
            cb(`Error processing request 101 ${errq}`, null);
            return;
          }
          cb(null, resultq);
        });
      } else {
        cb('Error. Client already exist.', null);
      }
    });
  },
  updateclient(uid, {
    clientid, clientname,
    address1, address2,
    districtid, cityid,
    provinceid, countrycode,
    clientemail, contactnumber,
    clientstatus,
    extfield1, extfield2,
    extfield3, extfield4,
  }, cb) {
    if (!clientid || !clientname || !address1 || !districtid
          || !cityid || !provinceid || !countrycode || !clientemail
          || !contactnumber || !clientstatus || !uid) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }

    const searchval = clientname.replace(/\s/g, '');
    const searchstring = searchval.toUpperCase() + districtid;

    checkClient(searchstring, (err, result) => {
      if (err) {
        cb(`Error processing request 100 ${err}`, null);
        return;
      }
      if (result === 'NF') {
        const data = [{
          client_name: clientname,
          address_line_1: address1,
          address_line_2: address2,
          district_id: districtid,
          city_id: cityid,
          province_id: provinceid,
          country_code: countrycode,
          client_email: clientemail,
          contact_number: contactnumber,
          client_status: clientstatus,
          search_string: searchstring,
          changed_by: uid,
          changed_date: new Date(),
          ext_field1: extfield1,
          ext_field2: extfield2,
          ext_field3: extfield3,
          ext_field4: extfield4,
        }, clientid];
        const query = 'UPDATE clients SET ? WHERE client_id = ?';

        db.save(query, data, (errq, resultq) => {
          if (errq) {
            cb(`Error processing request 101 ${errq}`, null);
            return;
          }
          cb(null, resultq);
        });
      } else {
        cb('No update. Client already exist.', null);
      }
    });
  },
  deleteclient(cid, cb) {
    if (!cid) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    checkClientProvisioning(cid, (err, result) => {
      if (err) {
        cb(`Error processing request 100 ${err}`, null);
        return;
      }
      if (result === 'NF') {
        const data = [cid];
        const query = 'DELETE FROM clients WHERE client_id = ?';

        db.save(query, data, (errq, resultq) => {
          if (errq) {
            cb(`Error processing request 101 ${errq}`, null);
            return;
          }
          cb(null, resultq);
        });
      } else {
        cb('Error. Client is already linked to active user.', null);
      }
    });
  },
  getclient(cid, cb) {
    if (!cid) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    // find the user
    const query = 'SELECT * FROM clients WHERE client_id = ?';
    const qparams = [cid];
    db.find(query, qparams, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (result[0]) {
        cb(null, result[0]);
      } else {
        cb('No client data found.', null);
      }
    });
  },
  listaggclients({
    searchinput, status, limit, page, sortby, sorttype,
  }, cb) {
    let whereclause;
    const qparams = [];

    const offset = (page - 1) * limit;

    whereclause = 'WHERE 1 ';

    if (searchinput) {
      whereclause += `AND ( client_name LIKE ? OR 
                                              address_line_1 LIKE ? OR 
                                              address_line_2 LIKE ? OR 
                                              district_name LIKE ? OR 
                                              city_name LIKE ? OR 
                                              province_name LIKE ? ) `;
      qparams.push(`%${searchinput}%`,
        `%${searchinput}%`,
        `%${searchinput}%`,
        `%${searchinput}%`,
        `%${searchinput}%`,
        `%${searchinput}%`);
    }

    if (status) {
      whereclause += 'AND client_status = ? ';
      qparams.push(status);
    }

    const query = `SELECT T.client_id, 
                      T.client_name,
                      T.address_line_1,
                      T.address_line_2,
                      A.config_name AS country,
                      E.district_name, 
                      D.city_name, 
                      C.province_name,
                      B.config_name AS status, 
                      T.created_by, 
                      T.created_date, 
                      T.changed_by, 
                      T.changed_date,
                      T.ext_field1,
                      T.ext_field2,
                      T.ext_field3,
                      T.ext_field4 
                  FROM clients as T 
                  LEFT JOIN config AS A ON T.country_code = A.config_code 
                      AND A.group_code = 'CNTYCD' 
                      AND A.config_status = 'STSACT' 
                  LEFT JOIN config AS B ON T.client_status = B.config_code 
                      AND B.group_code = 'STSENT' 
                      AND B.config_status = 'STSACT' 
                  LEFT JOIN province AS C ON T.province_id = C.province_id 
                      AND C.province_status = 'STSACT' 
                  LEFT JOIN city AS D ON T.city_id = D.city_id 
                      AND D.city_status = 'STSACT' 
                  LEFT JOIN district AS E ON T.district_id = E.district_id 
                      AND E.district_status = 'STSACT' 
                ${whereclause} ORDER BY ${sortby} ${sorttype}`;

    db.findwPagination(query, qparams, offset, limit, (err, results, numPages, numRows) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
      } else {
        cb(null, results, numPages, numRows);
      }
    });
  },
  getaggclient(cid, cb) {
    if (!cid) {
      cb('Posted data is not correct or incompleted.', null);
      return;
    }
    const query = `SELECT T.client_id, 
                      T.client_name,
                      T.address_line_1,
                      T.address_line_2,
                      A.config_name AS country,
                      E.district_name, 
                      D.city_name, 
                      C.province_name,
                      B.config_name AS status, 
                      T.client_email, 
                      T.contact_number, 
                      T.created_by, 
                      T.created_date, 
                      T.changed_by, 
                      T.changed_date,
                      T.ext_field1,
                      T.ext_field2,
                      T.ext_field3,
                      T.ext_field4 
                  FROM clients as T 
                  LEFT JOIN config AS A ON T.country_code = A.config_code 
                      AND A.group_code = 'CNTYCD' 
                      AND A.config_status = 'STSACT' 
                  LEFT JOIN config AS B ON T.client_status = B.config_code 
                      AND B.group_code = 'STSENT' 
                      AND B.config_status = 'STSACT' 
                  LEFT JOIN province AS C ON T.province_id = C.province_id 
                      AND C.province_status = 'STSACT' 
                  LEFT JOIN city AS D ON T.city_id = D.city_id 
                      AND D.city_status = 'STSACT' 
                  LEFT JOIN district AS E ON T.district_id = E.district_id 
                      AND E.district_status = 'STSACT' 
                  WHERE client_id = ?`;

    const qparams = [cid];

    db.find(query, qparams, (err, result) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (result[0]) {
        cb(null, result[0]);
      } else {
        cb('No client data found.', null);
      }
    });
  },
  listactiveclients(clientname, cb) {
    const query = `SELECT client_id, 
                          client_name,
                          address_line_1,
                          address_line_2
                  FROM clients
                  WHERE client_name LIKE ? 
                      AND client_status = ? 
                  ORDER BY client_name ASC 
                  LIMIT 100`;

    const qparams = [`%${clientname}%`, 'STSACT'];

    db.find(query, qparams, (err, results) => {
      if (err) {
        cb(`Error processing request ${err}`, null);
        return;
      }
      if (results[0]) {
        cb(null, results);
      } else {
        cb('No client data found.', null);
      }
    });
  },
};
