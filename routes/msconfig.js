const Msconfig = require('../models/msconfig.js');

exports.listactiveconfigbygroupRouterHandler = (req, res) => {
  const group = req.params.id;

  Msconfig.listactiveconfigbygroup(group, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    return res.status(200).json({
      success: true,
      data: result,
    });
  });
};

exports.listactivecountriesRouterHandler = (req, res) => {
  Msconfig.listactivecountries((err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    return res.status(200).json({
      success: true,
      data: result,
    });
  });
};

exports.getmsconfigvalueRouterHandler = (req, res) => {
  const code = req.params.id;
  const { group } = req.query;

  Msconfig.getmsconfigvalue(code, group, (err, result) => {
    if (err) {
      return res.status(202).json({ success: false, message: err });
    }
    return res.status(200).json({
      success: true,
      data: result,
    });
  });
};
