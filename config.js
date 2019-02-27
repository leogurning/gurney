const crypto = require('crypto');

module.exports = {
  serverport: 2012,
  tokenexp: '1d',
  secret: '!$3cret4@uth',
  /* MySQL parameters */
  mysql_host: 'localhost',
  mysql_user: 'root',
  mysql_password: 'rootmysql2017',
  mysql_db: 'ylegudb',
  /* Cloudinary parameters */
  cloud_name: 'legu',
  api_key: '487496572873139',
  api_secret: 'jmvqdISXnEp_vTxOCHe8Yl47HPw',

  /* SMTP Email parameters */
  email_service: 'Gmail',
  email_userid: 'silenomatteo',
  email_clientid: '1047411664580-k9gjfg00j5t47eb4h02rjkf4m2voqc5p.apps.googleusercontent.com',
  email_clientsecret: 'gneh8xVr95_tSxXt-7rk-uJq',
  email_refresh_token: '1/8bbiohk0wbcpxv1kevh6tOcZd3Sj3RnMlM1y2laTkVo',

  /* Global Function */
  convertUTCDateToLocalDate(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
  },
  createRandomHash(base, secret) {
    let rand = 0; let randhash = '0';
    rand = Math.floor((Math.random() * base) + (Math.random() * base));
    randhash = crypto.createHmac('sha256', secret).update(`randomNo:${rand.toString()}`).digest('hex');

    return randhash;
  },
  getProtocol(req) {
    let proto = req.connection.encrypted ? 'https' : 'http';
    // only do this if you trust the proxy
    proto = req.headers['x-forwarded-proto'] || proto;
    return proto.split(/\s*,\s*/)[0];
  },
};
