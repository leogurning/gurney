const config = require('../config');
const Province = require('../models/province.js');
const City = require('../models/city.js');
const District = require('../models/district.js');

exports.addprovinceRoutingHandler = (req, res) => {
  const userid = req.params.id;
  const {
    provincecode, provincename,
    provinceid, countrycode,
    extfield1, extfield2,
    extfield3, extfield4,
  } = req.body;

  Province.addprovince(userid, {
    provincecode,
    provincename,
    provinceid,
    countrycode,
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
        message: 'Province added successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.updateprovinceRoutingHandler = (req, res) => {
  const userid = req.params.id;
  const {
    provincecode, provincename,
    provinceid, countrycode,
    status, extfield1,
    extfield2, extfield3,
    extfield4,
  } = req.body;

  Province.updateprovince(userid, {
    provincecode,
    provincename,
    provinceid,
    countrycode,
    status,
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
        message: 'Province updated successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.deleteprovinceRoutingHandler = (req, res) => {
  const provinceid = req.params.id;

  Province.deleteprovince(provinceid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'Province deleted successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.getprovinceRoutingHandler = (req, res) => {
  const provinceid = req.params.id;

  Province.getprovince(provinceid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        data: {
          province_id: result.province_id,
          country_code: result.country_code,
          province_code: result.province_code,
          province_name: result.province_name,
          province_status: result.province_status,
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

exports.listaggprovinceRoutingHandler = (req, res) => {
  const { provincename, status } = req.body;

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
    sortby = 'province_name';
  } else if (sortby.indexOf('-') > -1) {
    sorttype = 'DESC';
    // remove minus sign from query of sortby, mark for ascending sort type
    sortby = sortby.slice(1, sortby.length);
  } else {
    sorttype = 'ASC';
  }

  Province.listaggprovince({
    provincename,
    status,
    limit,
    page,
    sortby,
    sorttype,
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

exports.listactiveprovinceRoutingHandler = (req, res) => {
  const countrycode = req.params.id;
  const { provincename } = req.body;

  Province.listactiveprovince(countrycode, provincename, (err, results) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    return res.status(200).json({
      success: true,
      data: results,
    });
  });
};

exports.getaggprovinceRoutingHandler = (req, res) => {
  const provinceid = req.params.id;

  Province.getaggprovince(provinceid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        data: {
          province_id: result.province_id,
          country_code: result.country,
          province_code: result.province_code,
          province_name: result.province_name,
          province_status: result.status,
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

exports.addcityRoutingHandler = (req, res) => {
  const userid = req.params.id;
  const {
    cityid, provinceid,
    countrycode, cityname,
    citycode, extfield1,
    extfield2, extfield3,
    extfield4,
  } = req.body;

  City.addcity(userid, {
    cityid,
    provinceid,
    countrycode,
    cityname,
    citycode,
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
        message: 'City added successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.updatecityRoutingHandler = (req, res) => {
  const userid = req.params.id;
  const {
    cityid, cityname,
    provinceid, countrycode,
    citycode, status,
    extfield1, extfield2,
    extfield3, extfield4,
  } = req.body;

  City.updatecity(userid, {
    cityid,
    cityname,
    provinceid,
    countrycode,
    citycode,
    status,
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
        message: 'City updated successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.deletecityRoutingHandler = (req, res) => {
  const cityid = req.params.id;

  City.deletecity(cityid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'City deleted successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.getcityRoutingHandler = (req, res) => {
  const cityid = req.params.id;

  City.getcity(cityid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        data: {
          city_id: result.city_id,
          province_id: result.province_id,
          country_code: result.country_code,
          city_code: result.city_code,
          city_name: result.city_name,
          city_status: result.city_status,
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

exports.listaggcityRoutingHandler = (req, res) => {
  const {
    provincename, cityname,
    status,
  } = req.body;

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
    sortby = 'city_name';
  } else if (sortby.indexOf('-') > -1) {
    sorttype = 'DESC';
    // remove minus sign from query of sortby, mark for ascending sort type
    sortby = sortby.slice(1, sortby.length);
  } else {
    sorttype = 'ASC';
  }

  City.listaggcity({
    provincename,
    cityname,
    status,
    limit,
    page,
    sortby,
    sorttype,
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

exports.getaggcityRoutingHandler = (req, res) => {
  const cityid = req.params.id;

  City.getaggcity(cityid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        data: {
          city_id: result.city_id,
          country_code: result.country,
          city_code: result.city_code,
          province_name: result.province_name,
          city_name: result.city_name,
          city_status: result.status,
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

exports.listactivecityRoutingHandler = (req, res) => {
  const provinceid = req.params.id;
  const { cityname } = req.body;

  City.listactivecity(provinceid, cityname, (err, results) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    return res.status(200).json({
      success: true,
      data: results,
    });
  });
};

exports.adddistrictRoutingHandler = (req, res) => {
  const userid = req.params.id;
  const {
    districtid, cityid,
    provinceid, countrycode,
    districtcode, districtname,
    extfield1, extfield2,
    extfield3, extfield4,
  } = req.body;

  District.adddistrict(userid, {
    districtid,
    cityid,
    provinceid,
    countrycode,
    districtcode,
    districtname,
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
        message: 'District added successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.updatedistrictRoutingHandler = (req, res) => {
  const userid = req.params.id;
  const {
    districtid, cityid,
    provinceid, countrycode,
    districtcode, districtname,
    extfield1, extfield2,
    extfield3, extfield4,
    status,
  } = req.body;

  District.updatedistrict(userid, {
    districtid,
    cityid,
    provinceid,
    countrycode,
    districtcode,
    districtname,
    extfield1,
    extfield2,
    extfield3,
    extfield4,
    status,
  }, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'District updated successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.deletedistrictRoutingHandler = (req, res) => {
  const districtid = req.params.id;

  District.deletedistrict(districtid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'District deleted successfully.',
      });
    }
    return res.status(201).json({
      success: false,
      message: 'Error undefined result. Please try again.',
    });
  });
};

exports.getdistrictRoutingHandler = (req, res) => {
  const districtid = req.params.id;

  District.getdistrict(districtid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        data: {
          district_id: result.district_id,
          city_id: result.city_id,
          province_id: result.province_id,
          country_code: result.country_code,
          district_code: result.district_code,
          district_name: result.district_name,
          district_status: result.district_status,
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

exports.listaggdistrictRoutingHandler = (req, res) => {
  const {
    provincename, cityname,
    districtname, status,
  } = req.body;

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
    sortby = 'district_name';
  } else if (sortby.indexOf('-') > -1) {
    sorttype = 'DESC';
    // remove minus sign from query of sortby, mark for ascending sort type
    sortby = sortby.slice(1, sortby.length);
  } else {
    sorttype = 'ASC';
  }

  District.listaggdistrict({
    provincename,
    cityname,
    districtname,
    status,
    limit,
    page,
    sortby,
    sorttype,
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

exports.getaggdistrictRoutingHandler = (req, res) => {
  const districtid = req.params.id;

  District.getaggdistrict(districtid, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    if (result) {
      return res.status(200).json({
        success: true,
        data: {
          district_id: result.district_id,
          city_name: result.city_name,
          province_name: result.province_name,
          country_code: result.country,
          district_code: result.district_code,
          district_name: result.district_name,
          district_status: result.status,
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

exports.listactivedistrictRoutingHandler = (req, res) => {
  const cityid = req.params.id;
  const { districtname } = req.body;

  District.listactivedistrict(cityid, districtname, (err, results) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    return res.status(200).json({
      success: true,
      data: results,
    });
  });
};
