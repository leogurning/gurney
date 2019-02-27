var db = require('../dbmysql');
var config = require('../config');

exports.addprovince = function(req, res, next){
    const userid = req.params.id;
    const provincecode = req.body.provincecode;
    const provincename = req.body.provincename;
    const provinceid = req.body.provinceid;
    const countrycode = req.body.countrycode;
    const extfield1	= req.body.extfield1;
	const extfield2	= req.body.extfield2;
	const extfield3	= req.body.extfield3;
	const extfield4	= req.body.extfield4;

    if (!provincename || !provinceid || !countrycode || !userid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }
    
    let data = {
        province_id: provinceid,
        country_code: countrycode,
        province_code: provincecode,
        province_name: provincename,
        province_status: 'STSACT',
        created_by: userid,
        created_date: new Date(),
        changed_by: userid,
        changed_date: new Date(),
        ext_field1:	extfield1,
        ext_field2:	extfield2,
        ext_field3:	extfield3,
        ext_field4:	extfield4
    };
    let query = 'INSERT INTO province SET ?';
    db.save(query, data, function(err,result){
        if (err) {return res.status(202).json({ success: false, message:'Error processing request '+ err});}
        res.status(200).json({
            success: true,
            message: 'Province added successfully.'
        });
    });
}
exports.updateprovince = function(req, res, next){
    const userid = req.params.id;
    const provincecode = req.body.provincecode;
    const provincename = req.body.provincename;
    const provinceid = req.body.provinceid;
    const countrycode = req.body.countrycode;
    const status = req.body.status;
    const extfield1	= req.body.extfield1;
	const extfield2	= req.body.extfield2;
	const extfield3	= req.body.extfield3;
    const extfield4	= req.body.extfield4;
    
    if (!status || !provincename || !provinceid || !countrycode || !userid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }
    
    let data = [{
        country_code: countrycode,
        province_code: provincecode,
        province_name: provincename,
        province_status: status,
        changed_by: userid,
        changed_date: new Date(),
        ext_field1:	extfield1,
        ext_field2:	extfield2,
        ext_field3:	extfield3,
        ext_field4:	extfield4
    }, provinceid];
    let query = 'UPDATE province SET ? WHERE province_id = ?';

    db.save(query, data, function(err,result){
        if (err) {return res.status(202).json({ success: false, message:'Error processing request '+ err});}
        res.status(200).json({
            success: true,
            message: 'Province updated successfully.'
        });
    });
}

exports.deleteprovince = function(req, res, next) {
    const userid = req.params.id;
    const provinceid = req.body.provinceid;

    if (!provinceid || !userid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }
    let data = [provinceid];
    let query = 'DELETE FROM province WHERE province_id = ?';

    db.save(query, data, function(err,result){
        if (err) {return res.status(202).json({ success: false, message:'Error processing request '+ err});}
        res.status(200).json({
            success: true,
            message: 'Province deleted successfully.'
        });
    });
}

exports.getprovince = function(req, res, next) {
    const provinceid = req.params.id;

    if (!provinceid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }
    // find the user
    let query = 'SELECT * FROM province WHERE province_id = ?';
    let qparams = [provinceid];
    db.find(query, qparams, function(err, result) {
        if(err){ return res.status(202).json({ success: false, message: 'Error processing request '+ err}); }
        if (result[0]) {
            res.status(200).json({
                success: true, 
                data: { 'province_id': result[0].province_id, 
                    'country_code': result[0].country_code, 
                    'province_code': result[0].province_code, 
                    'province_name': result[0].province_name, 
                    'province_status': result[0].province_status, 
                    'created_by': result[0].created_by, 
                    'created_date': config.convertUTCDateToLocalDate(result[0].created_date), 
                    'changed_by': result[0].changed_by, 
                    'changed_date': config.convertUTCDateToLocalDate(result[0].changed_date), 
                    'ext_field1': result[0].ext_field1, 
                    'ext_field2': result[0].ext_field2, 
                    'ext_field3': result[0].ext_field3, 
                    'ext_field4': result[0].ext_field4
            } 
            });
        } else {
            res.status(201).json({
                success: false, 
                message: 'No province data found.'
            });
        }
    });

}

exports.listaggprovince = function(req, res, next) {
    const userid = req.params.id;
    const provincename = req.body.provincename;
    const status = req.body.status;

    var totalcount;    
    let limit = parseInt(req.query.limit);
    let page = parseInt(req.body.page || req.query.page);
    let sortby = req.body.sortby || req.query.sortby;
    var query, whereclause;
    var qparams = [];

    if (!userid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }

    if(!limit || limit < 1) {
        limit = 10;
    }
    
    if(!page || page < 1) {
        page = 1;
    }
    
    if(!sortby) {
        sortby = 'province_name';
    }
    var offset = (page - 1) * limit;

    whereclause = 'WHERE 1 ';

    if (provincename) {
        whereclause = whereclause + `AND province_name LIKE ? `;
        qparams.push('%'+provincename+'%');
    }

    if (status) {
        whereclause = whereclause + 'AND province_status = ? ';
        qparams.push(status);
    }

    query = `SELECT T.province_id, 
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
                    AND B.config_status = 'STSACT' `
                +   whereclause
                + ` ORDER BY `+ sortby + ' ASC';

    db.findwPagination(query, qparams, offset, limit, function(err, results, numPages, numRows) {
        if(err) 
        {
            res.status(202).json({
                success: false, 
                message: 'Error processing request '+ err
            });
        }
        else
        { 
            res.status(200).json({
                success: true, 
                data: results,
                npage: numPages,
                totalcount: numRows
            });
        }
    });    

}

exports.listactiveprovince = function(req, res, next) {

    const countrycode = req.params.id;
    const provincename = req.body.provincename;

    if (!countrycode) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }
/*
    if (!provincename) {
        return res.status(201).json({ success: true, data: []});
    }
*/
    let query = `SELECT province_id, 
                        province_name
                FROM province
                WHERE province_name LIKE ? 
                    AND country_code = ?
                    AND province_status = ? 
                ORDER BY province_name ASC 
                LIMIT 100`
                
    let qparams = ['%'+provincename+'%', countrycode, 'STSACT'];

    db.find(query, qparams, function(err, results) {
        if(err){ return res.status(202).json({ success: false, message: 'Error processing request '+ err}); }
        if (results[0]) {
            res.status(200).json({
                success: true, 
                data: results
            });
        } else {
            res.status(201).json({
                success: false, 
                message: 'No province data found.'
            });
        }
    }); 

}

exports.getaggprovince = function(req, res, next) {
    const provinceid = req.params.id;

    if (!provinceid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }
    let query = `SELECT T.province_id, 
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
                WHERE province_id = ?`
                
    let qparams = [provinceid]

    db.find(query, qparams, function(err, result) {
        if(err){ return res.status(202).json({ success: false, message: 'Error processing request '+ err}); }
        if (result[0]) {
            res.status(200).json({
                success: true, 
                data: {'province_id': result[0].province_id, 
                    'country_code': result[0].country, 
                    'province_code': result[0].province_code, 
                    'province_name': result[0].province_name, 
                    'province_status': result[0].status, 
                    'created_by': result[0].created_by, 
                    'created_date': config.convertUTCDateToLocalDate(result[0].created_date), 
                    'changed_by': result[0].changed_by, 
                    'changed_date': config.convertUTCDateToLocalDate(result[0].changed_date), 
                    'ext_field1': result[0].ext_field1, 
                    'ext_field2': result[0].ext_field2, 
                    'ext_field3': result[0].ext_field3, 
                    'ext_field4': result[0].ext_field4
                } 
            });
        } else {
            res.status(201).json({
                success: false, 
                message: 'No province data found.'
            });
        }
    });  

}

exports.addcity = function(req, res, next){
    const userid = req.params.id;
    const cityid = req.body.cityid;
    const provinceid = req.body.provinceid;
    const countrycode = req.body.countrycode;
    const cityname = req.body.cityname;
    const citycode = req.body.citycode;
    const extfield1	= req.body.extfield1;
	const extfield2	= req.body.extfield2;
	const extfield3	= req.body.extfield3;
    const extfield4	= req.body.extfield4;
    
    if (!cityid || !cityname || !provinceid || !countrycode || !userid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }
    
    let data = {
        city_id: cityid,
        province_id: provinceid,
        country_code: countrycode,
        city_code: citycode,
        city_name: cityname,
        city_status: 'STSACT',
        created_by: userid,
        created_date: new Date(),
        changed_by: userid,
        changed_date: new Date(),
        ext_field1:	extfield1,
        ext_field2:	extfield2,
        ext_field3:	extfield3,
        ext_field4:	extfield4
    };
    let query = 'INSERT INTO city SET ?';
    db.save(query, data, function(err,result){
        if (err) {return res.status(202).json({ success: false, message:'Error processing request '+ err});}
        res.status(200).json({
            success: true,
            message: 'City added successfully.'
        });
    });
}

exports.updatecity = function(req, res, next){
    const userid = req.params.id;
    const cityid = req.body.cityid;
    const cityname = req.body.cityname;
    const provinceid = req.body.provinceid;
    const countrycode = req.body.countrycode;
    const citycode = req.body.citycode;
    const status = req.body.status;
    const extfield1	= req.body.extfield1;
	const extfield2	= req.body.extfield2;
	const extfield3	= req.body.extfield3;
    const extfield4	= req.body.extfield4;

    if (!status || !cityid || !cityname || !provinceid || !countrycode || !userid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }
    
    let data = [{
        province_id: provinceid,
        country_code: countrycode,
        city_code: citycode,
        city_name: cityname,
        city_status: status,
        changed_by: userid,
        changed_date: new Date(),
        ext_field1:	extfield1,
        ext_field2:	extfield2,
        ext_field3:	extfield3,
        ext_field4:	extfield4
    }, cityid];
    let query = 'UPDATE city SET ? WHERE city_id = ?';

    db.save(query, data, function(err,result){
        if (err) {return res.status(202).json({ success: false, message:'Error processing request '+ err});}
        res.status(200).json({
            success: true,
            message: 'City updated successfully.'
        });
    });
}

exports.deletecity = function(req, res, next) {
    const userid = req.params.id;
    const cityid = req.body.cityid;

    if (!cityid || !userid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }
    let data = [cityid];
    let query = 'DELETE FROM city WHERE city_id = ?';

    db.save(query, data, function(err,result){
        if (err) {return res.status(202).json({ success: false, message:'Error processing request '+ err});}
        res.status(200).json({
            success: true,
            message: 'City deleted successfully.'
        });
    });
}

exports.getcity = function(req, res, next) {
    const cityid = req.params.id;

    if (!cityid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }
    // find the user
    let query = 'SELECT * FROM city WHERE city_id = ?';
    let qparams = [cityid];
    db.find(query, qparams, function(err, result) {
        if(err){ return res.status(202).json({ success: false, message: 'Error processing request '+ err}); }
        if (result[0]) {
            res.status(200).json({
                success: true, 
                data: { 'city_id': result[0].city_id,  
                    'province_id': result[0].province_id,
                    'country_code': result[0].country_code, 
                    'city_code': result[0].city_code, 
                    'city_name': result[0].city_name, 
                    'city_status': result[0].city_status, 
                    'created_by': result[0].created_by, 
                    'created_date': config.convertUTCDateToLocalDate(result[0].created_date), 
                    'changed_by': result[0].changed_by, 
                    'changed_date': config.convertUTCDateToLocalDate(result[0].changed_date), 
                    'ext_field1': result[0].ext_field1, 
                    'ext_field2': result[0].ext_field2, 
                    'ext_field3': result[0].ext_field3, 
                    'ext_field4': result[0].ext_field4
            } 
            });
        } else {
            res.status(201).json({
                success: false, 
                message: 'No city data found.'
            });
        }
    });

}

exports.listaggcity = function(req, res, next) {
    const userid = req.params.id;
    const provincename = req.body.provincename;
    const cityname = req.body.cityname;
    const status = req.body.status;

    var totalcount;    
    let limit = parseInt(req.query.limit);
    let page = parseInt(req.body.page || req.query.page);
    let sortby = req.body.sortby || req.query.sortby;
    var query, whereclause;
    var qparams = [];

    if (!userid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }

    if(!limit || limit < 1) {
        limit = 10;
    }
    
    if(!page || page < 1) {
        page = 1;
    }
    
    if(!sortby) {
        sortby = 'city_name';
    }
    var offset = (page - 1) * limit;

    whereclause = 'WHERE 1 ';

    if (cityname) {
        whereclause = whereclause + `AND city_name LIKE ? `;
        qparams.push('%'+cityname+'%');
    }

    if (provincename) {
        whereclause = whereclause + `AND province_name LIKE ? `;
        qparams.push('%'+provincename+'%');
    }

    if (status) {
        whereclause = whereclause + 'AND city_status = ? ';
        qparams.push(status);
    }
    query = `SELECT city_id, 
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
                    AND C.config_status = 'STSACT' `
                +   whereclause
                + ` ORDER BY `+ sortby + ' ASC';

    db.findwPagination(query, qparams, offset, limit, function(err, results, numPages, numRows) {
        if(err) 
        {
            res.status(202).json({
                success: false, 
                message: 'Error processing request '+ err
            });
        }
        else
        { 
            res.status(200).json({
                success: true, 
                data: results,
                npage: numPages,
                totalcount: numRows
            });
        }
    });    

}

exports.getaggcity = function(req, res, next) {
    const cityid = req.params.id;

    if (!cityid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }

    let query = `SELECT city_id, 
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
            WHERE city_id = ?`

    let qparams = [cityid]

    db.find(query, qparams, function(err, result) {
        if(err){ return res.status(202).json({ success: false, message: 'Error processing request '+ err}); }
        if (result[0]) {
            res.status(200).json({
                success: true, 
                data: {'city_id': result[0].city_id, 
                    'country_code': result[0].country, 
                    'city_code': result[0].city_code, 
                    'province_name': result[0].province_name, 
                    'city_name': result[0].city_name, 
                    'city_status': result[0].status, 
                    'created_by': result[0].created_by, 
                    'created_date': config.convertUTCDateToLocalDate(result[0].created_date), 
                    'changed_by': result[0].changed_by, 
                    'changed_date': config.convertUTCDateToLocalDate(result[0].changed_date), 
                    'ext_field1': result[0].ext_field1, 
                    'ext_field2': result[0].ext_field2, 
                    'ext_field3': result[0].ext_field3, 
                    'ext_field4': result[0].ext_field4
                } 
            });
        } else {
            res.status(201).json({
                success: false, 
                message: 'No city data found.'
            });
        }
    });  

}

exports.listactivecity = function(req, res, next) {
    
    const provinceid = req.params.id;
    const cityname = req.body.cityname;

    if (!provinceid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }

    let query = `SELECT city_id, 
                        city_name
                FROM city
                WHERE city_name LIKE ? 
                    AND province_id = ?
                    AND city_status = ? 
                ORDER BY city_name ASC 
                LIMIT 100`
                
    let qparams = ['%'+cityname+'%', provinceid, 'STSACT'];

    db.find(query, qparams, function(err, results) {
        if(err){ return res.status(202).json({ success: false, message: 'Error processing request '+ err}); }
        if (results[0]) {
            res.status(200).json({
                success: true, 
                data: results
            });
        } else {
            res.status(201).json({
                success: false, 
                message: 'No city data found.'
            });
        }
    }); 

}

exports.adddistrict = function(req, res, next){
    const userid = req.params.id;
    const districtid = req.body.districtid;
    const cityid = req.body.cityid;
    const provinceid = req.body.provinceid;
    const countrycode = req.body.countrycode;
    const districtcode = req.body.districtcode;
    const districtname	= req.body.districtname;
    const extfield1 = req.body.extfield1;
    const extfield2	= req.body.extfield2;
    const extfield3	= req.body.extfield3;
    const extfield4	= req.body.extfield4;
    
    if (!districtid || !cityid || !districtname || !provinceid || !countrycode || !userid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }

    let data = {
        district_id: districtid,
        city_id: cityid,
        province_id: provinceid,
        country_code: countrycode,
        district_code: districtcode,
        district_name: districtname,
        district_status: 'STSACT',
        created_by: userid,
        created_date: new Date(),
        changed_by: userid,
        changed_date: new Date(),
        ext_field1:	extfield1,
        ext_field2:	extfield2,
        ext_field3:	extfield3,
        ext_field4:	extfield4
    };
    let query = 'INSERT INTO district SET ?';
    db.save(query, data, function(err,result){
        if (err) {return res.status(202).json({ success: false, message:'Error processing request '+ err});}
        res.status(200).json({
            success: true,
            message: 'District added successfully.'
        });
    });
}

exports.updatedistrict = function(req, res, next){

    const userid = req.params.id;
    const districtid = req.body.districtid;
    const cityid = req.body.cityid;
    const provinceid = req.body.provinceid;
    const countrycode = req.body.countrycode;
    const districtcode = req.body.districtcode;
    const districtname	= req.body.districtname;
    const extfield1 = req.body.extfield1;
    const extfield2	= req.body.extfield2;
    const extfield3	= req.body.extfield3;
    const extfield4	= req.body.extfield4;
    const status = req.body.status;

    if (!status || !districtid || !cityid || !districtname || !provinceid || !countrycode || !userid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }
    
    let data = [{
        city_id: cityid,
        province_id: provinceid,
        country_code: countrycode,
        district_code: districtcode,
        district_name: districtname,
        district_status: status,
        changed_by: userid,
        changed_date: new Date(),
        ext_field1:	extfield1,
        ext_field2:	extfield2,
        ext_field3:	extfield3,
        ext_field4:	extfield4
    }, districtid];

    let query = 'UPDATE district SET ? WHERE district_id = ?';

    db.save(query, data, function(err,result){
        if (err) {return res.status(202).json({ success: false, message:'Error processing request '+ err});}
        res.status(200).json({
            success: true,
            message: 'District updated successfully.'
        });
    });
}

exports.deletedistrict = function(req, res, next) {
    const userid = req.params.id;
    const districtid = req.body.districtid;

    if (!districtid || !userid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }
    let data = [districtid];
    let query = 'DELETE FROM district WHERE district_id = ?';

    db.save(query, data, function(err,result){
        if (err) {return res.status(202).json({ success: false, message:'Error processing request '+ err});}
        res.status(200).json({
            success: true,
            message: 'District deleted successfully.'
        });
    });
}

exports.getdistrict = function(req, res, next) {
    const districtid = req.params.id;

    if (!districtid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }
    // find the user
    let query = 'SELECT * FROM district WHERE district_id = ?';
    let qparams = [districtid];
    db.find(query, qparams, function(err, result) {
        if(err){ return res.status(202).json({ success: false, message: 'Error processing request '+ err}); }
        if (result[0]) {
            res.status(200).json({
                success: true, 
                data: { 'district_id': result[0].district_id,
                    'city_id': result[0].city_id,  
                    'province_id': result[0].province_id,
                    'country_code': result[0].country_code, 
                    'district_code': result[0].district_code, 
                    'district_name': result[0].district_name, 
                    'district_status': result[0].district_status, 
                    'created_by': result[0].created_by, 
                    'created_date': config.convertUTCDateToLocalDate(result[0].created_date), 
                    'changed_by': result[0].changed_by, 
                    'changed_date': config.convertUTCDateToLocalDate(result[0].changed_date), 
                    'ext_field1': result[0].ext_field1, 
                    'ext_field2': result[0].ext_field2, 
                    'ext_field3': result[0].ext_field3, 
                    'ext_field4': result[0].ext_field4
                } 
            });
        } else {
            res.status(201).json({
                success: false, 
                message: 'No district data found.'
            });
        }
    });

}

exports.listaggdistrict = function(req, res, next) {
    const userid = req.params.id;
    const provincename = req.body.provincename;
    const cityname = req.body.cityname;
    const districtname = req.body.districtname;
    const status = req.body.status;

    var totalcount;    
    let limit = parseInt(req.query.limit);
    let page = parseInt(req.body.page || req.query.page);
    let sortby = req.body.sortby || req.query.sortby;
    var query, whereclause;
    var qparams = [];

    if (!userid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }

    if(!limit || limit < 1) {
        limit = 10;
    }
    
    if(!page || page < 1) {
        page = 1;
    }
    
    if(!sortby) {
        sortby = 'district_name';
    }
    var offset = (page - 1) * limit;

    whereclause = 'WHERE 1 ';

    if (cityname) {
        whereclause = whereclause + `AND city_name LIKE ? `;
        qparams.push('%'+cityname+'%');
    }

    if (provincename) {
        whereclause = whereclause + `AND province_name LIKE ? `;
        qparams.push('%'+provincename+'%');
    }

    if (districtname) {
        whereclause = whereclause + `AND district_name LIKE ? `;
        qparams.push('%'+districtname+'%');
    }

    if (status) {
        whereclause = whereclause + 'AND district_status = ? ';
        qparams.push(status);
    }
    
    query = `SELECT T.district_id, 
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
                    AND D.config_status = 'STSACT' `
                +   whereclause
                + ` ORDER BY `+ sortby + ' ASC';

    db.findwPagination(query, qparams, offset, limit, function(err, results, numPages, numRows) {
        if(err) 
        {
            res.status(202).json({
                success: false, 
                message: 'Error processing request '+ err
            });
        }
        else
        { 
            res.status(200).json({
                success: true, 
                data: results,
                npage: numPages,
                totalcount: numRows
            });
        }
    });    

}

exports.getaggdistrict = function(req, res, next) {
    const districtid = req.params.id;

    if (!districtid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }

    let query = `SELECT T.district_id, 
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

    let qparams = [districtid]

    db.find(query, qparams, function(err, result) {
        if(err){ return res.status(202).json({ success: false, message: 'Error processing request '+ err}); }
        if (result[0]) {
            res.status(200).json({
                success: true, 
                data: { 'district_id': result[0].district_id, 
                    'city_name': result[0].city_name, 
                    'province_name': result[0].province_name,
                    'country_code': result[0].country, 
                    'district_code': result[0].district_code,
                    'district_name': result[0].district_name, 
                    'district_status': result[0].status, 
                    'created_by': result[0].created_by, 
                    'created_date': config.convertUTCDateToLocalDate(result[0].created_date), 
                    'changed_by': result[0].changed_by, 
                    'changed_date': config.convertUTCDateToLocalDate(result[0].changed_date), 
                    'ext_field1': result[0].ext_field1, 
                    'ext_field2': result[0].ext_field2, 
                    'ext_field3': result[0].ext_field3, 
                    'ext_field4': result[0].ext_field4
                } 
            });
        } else {
            res.status(201).json({
                success: false, 
                message: 'No district data found.'
            });
        }
    });  

}

exports.listactivedistrict = function(req, res, next) {
    
    const cityid = req.params.id;
    const districtname = req.body.districtname;

    if (!cityid) {
        return res.status(202).json({ success: false, message: 'Posted data is not correct or incompleted.'});
    }

    let query = `SELECT district_id, 
                        district_name
                FROM district
                WHERE district_name LIKE ? 
                    AND city_id = ?
                    AND district_status = ? 
                ORDER BY district_name ASC 
                LIMIT 100`
                
    let qparams = ['%'+districtname+'%', cityid, 'STSACT'];

    db.find(query, qparams, function(err, results) {
        if(err){ return res.status(202).json({ success: false, message: 'Error processing request '+ err}); }
        if (results[0]) {
            res.status(200).json({
                success: true, 
                data: results
            });
        } else {
            res.status(201).json({
                success: false, 
                message: 'No district data found.'
            });
        }
    }); 

}