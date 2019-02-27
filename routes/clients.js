const config = require('../config');
const Client = require('../models/clients.js');

exports.addclientRoutingHandler = (req, res) => {
  const userid = req.params.id;
  const {
    clientname, address1, address2,
    districtid, cityid, provinceid,
    countrycode, clientemail, contactnumber,
    extfield1, extfield2, extfield3, extfield4,
  } = req.body; // NOT NULL,

  Client.addclient(userid, {
    clientname,
    address1,
    address2,
    districtid,
    cityid,
    provinceid,
    countrycode,
    clientemail,
    contactnumber,
    extfield1,
    extfield2,
    extfield3,
    extfield4,
  }, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'Client added successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.updateclientRoutingHandler = (req, res) => {
  const userid = req.params.id;
  const {
    clientid, clientname,
    address1, address2,
    districtid, cityid,
    provinceid, countrycode,
    clientemail, contactnumber,
    extfield1, extfield2,
    extfield3, extfield4,
  } = req.body;
  const clientstatus = req.body.status; // NOT NULL,

  Client.updateclient(userid, {
    clientid,
    clientname,
    address1,
    address2,
    districtid,
    cityid,
    provinceid,
    countrycode,
    clientemail,
    contactnumber,
    clientstatus,
    extfield1,
    extfield2,
    extfield3,
    extfield4,
  }, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'Client updated successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.deleteclientRoutingHandler = (req, res) => {
  const clientid = req.params.id;

  Client.deleteclient(clientid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'Client deleted successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.getclientRoutingHandler = (req, res) => {
  const clientid = req.params.id;

  Client.getclient(clientid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        data: {
          client_id: result.client_id,
          client_name: result.client_name,
          address_line_1: result.address_line_1,
          address_line_2: result.address_line_2,
          district_id: result.district_id,
          city_id: result.city_id,
          province_id: result.province_id,
          country_code: result.country_code,
          client_email: result.client_email,
          contact_number: result.contact_number,
          client_status: result.client_status,
          created_by: result.created_by,
          created_date: config.convertUTCDateToLocalDate(result.created_date),
          changed_by: result.changed_by,
          changed_date: config.convertUTCDateToLocalDate(result.changed_date),
          ext_field1: result.ext_field1,
          ext_field2: result.ext_field2,
          ext_field3: result.ext_field3,
          ext_field4: result.ext_field4,
        },
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.listaggclientsRoutingHandler = (req, res) => {
  const { searchinput, status } = req.body;

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
    sortby = 'client_name';
  } else if (sortby.indexOf('-') > -1) {
    sorttype = 'DESC';
    // remove minus sign from query of sortby, mark for ascending sort type
    sortby = sortby.slice(1, sortby.length);
  } else {
    sorttype = 'ASC';
  }

  Client.listaggclients({
    searchinput, status, limit, page, sortby, sorttype,
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

exports.getaggclientRoutingHandler = (req, res) => {
  const clientid = req.params.id;

  Client.getaggclient(clientid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        data: {
          client_id: result.client_id,
          client_name: result.client_name,
          address_line_1: result.address_line_1,
          address_line_2: result.address_line_2,
          district_name: result.district_name,
          city_name: result.city_name,
          province_name: result.province_name,
          country_code: result.country,
          client_email: result.client_email,
          contact_number: result.contact_number,
          client_status: result.status,
          created_by: result.created_by,
          created_date: config.convertUTCDateToLocalDate(result.created_date),
          changed_by: result.changed_by,
          changed_date: config.convertUTCDateToLocalDate(result.changed_date),
          ext_field1: result.ext_field1,
          ext_field2: result.ext_field2,
          ext_field3: result.ext_field3,
          ext_field4: result.ext_field4,
        },
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.listactiveclientsRoutingHandler = (req, res) => {
  const { clientname } = req.body;
  Client.listactiveclients(clientname, (err, results) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    return res.status(200).json({
      success: true,
      data: results,
    });
  });
};
