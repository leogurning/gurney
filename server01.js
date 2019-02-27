const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const upload = require('express-fileupload');
// const path = require('path');

const config = require('./config');
const user = require('./routes/user.js');
const location = require('./routes/location.js');
const msconfig = require('./routes/msconfig.js');
const filetransfer = require('./routes/filetransfer.js');
const emailnotif = require('./routes/emailnotif.js');
const clients = require('./routes/clients.js');
const pendingusercli = require('./routes/pendingusercli.js');

const port = process.env.PORT || config.serverport;
const app = express();
app.use(upload()); // configure middleware. This is important for parse body in multipart form data
// Enable CORS from client-side
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') { res.sendStatus(204); } else { next(); }
});

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// basic routes
app.get('/', (req, res) => {
  res.send(`GURNEY API is running at host port:${port}/api`);
});

const apiRoutes = express.Router();
app.use('/api', apiRoutes);
apiRoutes.post('/registertechadmin', user.signupTechAdmRouterHandler);
apiRoutes.post('/registerClient', user.signupClientUserRouterHandler);
apiRoutes.get('/msconfigbygroup/:id', msconfig.listactiveconfigbygroupRouterHandler); // API get msconfig details of the msconfig group
apiRoutes.get('/msconfigactivecountries', msconfig.listactivecountriesRouterHandler); // API get msconfig details of the msconfigid
apiRoutes.get('/msconfigvalue/:id', msconfig.getmsconfigvalueRouterHandler); // API returns msconfig value of the msconfig code

apiRoutes.post('/listactiveprovince/:id', location.listactiveprovince); // API to retrieve province master data aggregate record based on province name and status
apiRoutes.post('/listactivecity/:id', location.listactivecity); // API to retrieve city master data aggregate record based on city name and status
apiRoutes.post('/listactivedistrict/:id', location.listactivedistrict); // API to retrieve list district master data record based on district name and status
apiRoutes.post('/sendemailverification/:id', emailnotif.sendemailverificationRouterHandler);
apiRoutes.get('/rcvemailverification', user.emverificationRouterHandler);
apiRoutes.post('/sendresetpwd', emailnotif.sendemailresetpasswordRouterHandler);
apiRoutes.get('/pgverification', emailnotif.pageverificationRouterHandler);

apiRoutes.post('/login', user.loginRouterHandler);
apiRoutes.post('/resetpassword', user.resetpasswordRouterHandler);

apiRoutes.use(user.authenticateRouterHandler); // route middleware to authenticate and check token

// authenticated routes
apiRoutes.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the authenticated routes!' });
});

apiRoutes.get('/user/:id', user.getuserDetailsRouterHandler); // API returns user details
apiRoutes.put('/user/:id', user.updateUserRouterHandler); // API updates user details
apiRoutes.put('/userphoto/:id', user.updatePhotoRouterHandler); // API updates user photo details
apiRoutes.post('/changeuserphoto/:id', user.changePhotoRouterHandler); // API updates user photo details
apiRoutes.put('/password/:id', user.updatePasswordRouterHandler); // API updates user password
apiRoutes.post('/useraddress/:id', user.adduseraddressRouterHandler); // API to add user address record
apiRoutes.put('/useraddress/:id', user.updateuseraddressRouterHandler); // API to update user address record
apiRoutes.delete('/useraddress/:id', user.deleteuseraddressRouterHandler); // API to delete user address record
apiRoutes.post('/deluseraddress/:id', user.deleteuseraddressRouterHandler); // API to delete user address record
apiRoutes.get('/useraddress/:id', user.getuseraddressRouterHandler); // API to retrieve user address record based on useraddress id
apiRoutes.post('/listagguseraddress/:id', user.listagguseraddressRouterHandler); // API to retrieve list user address record

apiRoutes.post('/usercontactno/:id', user.addusercontactnoRouterHandler); // API to add user contact no record
apiRoutes.put('/usercontactno/:id', user.updateusercontactnoRouterHandler); // API to update user contact no record
apiRoutes.delete('/usercontactno/:id', user.deleteusercontactnoRouterHandler); // API to delete user contact no record
apiRoutes.post('/delusercontactno/:id', user.deleteusercontactnoRouterHandler); // API to delete user contact no record
apiRoutes.get('/usercontactno/:id', user.getusercontactnoRouterHandler); // API to retrieve user contact no record based on user contact no id
apiRoutes.post('/listaggusercontactno/:id', user.listaggusercontactnoRouterHandler); // API to retrieve list user address record

apiRoutes.post('/province/:id', location.addprovince); // API to add province master data record
apiRoutes.put('/province/:id', location.updateprovince); // API to update province master data record
apiRoutes.delete('/province/:id', location.deleteprovince); // API to delete province master data record
apiRoutes.get('/province/:id', location.getprovince); // API to retrieve province master data record based on province id
apiRoutes.post('/listaggprovince/:id', location.listaggprovince); // API to retrieve province master data aggregate record based on province name and status
apiRoutes.get('/getaggprovince/:id', location.getaggprovince); // API to retrieve province master data aggregate record based on provinceid

apiRoutes.post('/city/:id', location.addcity); // API to add city master data record
apiRoutes.put('/city/:id', location.updatecity); // API to update city master data record
apiRoutes.delete('/city/:id', location.deletecity); // API to delete city master data record based on city id
apiRoutes.get('/city/:id', location.getcity); // API to retrieve city master data record based on city id
apiRoutes.post('/listaggcity/:id', location.listaggcity); // API to retrieve city master data aggregate record based on city name and status
apiRoutes.get('/getaggcity/:id', location.getaggcity); // API to retrieve city master data aggregate record based on cityid

apiRoutes.post('/district/:id', location.adddistrict); // API to add district master data record
apiRoutes.put('/district/:id', location.updatedistrict); // API to update district master data record
apiRoutes.delete('/district/:id', location.deletedistrict); // API to delete district master data record based on district id
apiRoutes.get('/district/:id', location.getdistrict); // API to retrieve district master data record based on district id
apiRoutes.post('/listaggdistrict/:id', location.listaggdistrict); // API to retrieve district master data aggregate record based on district name and status
apiRoutes.get('/getaggdistrict/:id', location.getaggdistrict); // API to retrieve district master data record based on district id

apiRoutes.post('/inputfileupload', filetransfer.inputfileuploadapi); // API to upload input file
apiRoutes.post('/inputfiledelete', filetransfer.inputfiledeleteapi); // API to delete input file

apiRoutes.post('/client/:id', clients.addclientRoutingHandler); // API to add client master data record
apiRoutes.put('/client/:id', clients.updateclientRoutingHandler); // API to update client master data record
apiRoutes.delete('/client/:id', clients.deleteclientRoutingHandler); // API to delete client master data record based on client id
apiRoutes.get('/client/:id', clients.getclientRoutingHandler); // API to retrieve client master data record based on client id
apiRoutes.post('/listaggclients', clients.listaggclientsRoutingHandler); // API to retrieve client master data aggregate record based on client name and status
apiRoutes.get('/getaggclient/:id', clients.getaggclientRoutingHandler); // API to retrieve client master data record based on client id
apiRoutes.post('/listactiveclients', clients.listactiveclientsRoutingHandler); // API to retrieve list client master data record based on client name and status

apiRoutes.post('/listaggpendingusercli', pendingusercli.listaggpendingusercliRouterHandler); // API to retrieve pending user client master data aggregate record based on user name
apiRoutes.put('/approveusercli/:id', pendingusercli.approveUserRouterHandler);
apiRoutes.put('/rejectusercli/:id', pendingusercli.rejectUserRouterHandler);

// kick off the server
app.listen(port);
console.log(`GURNEY API is listening at port:${port}`);
