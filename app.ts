import cluster  from 'cluster';
import os       from 'os';
import process  from 'process';
import express  from "express";
import dotenv   from "dotenv";
import path     from "path";
import morgan   from 'morgan';
import cors     from 'cors';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {

    console.log(`Primary ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker: any, code: any, signal: any) => {
        console.log(`Worker ${worker.process.pid} died`);
    });

} else {
    const app = express();

    // Logging:
    app.use(morgan('short'));

    // CORS Policies:
    app.use(cors());

    // Load Configs:
    dotenv.config();
    
    const PORT = process.env['PORT'] || 3536;

    // Body Parser:
    app.use(express.urlencoded({extended: true}));
    app.use(express.json());

    // Static Folder:
    app.use(express.static('./dist/public'));
    app.use('/article-files', express.static(path.join(__dirname, './public/d/Public/Production')));
    app.use('/profiles', express.static(path.join(__dirname, './public/d/hr/AndroidData/Pictures')));
    app.use('/work-order-files', express.static(path.join(__dirname, './public/d/Public/production_data')));

    // Routers
    const files                 = require('./routes/V2/files');
    const HRImageRouter         = require('./routes/V2/HR/hrImage');
    const userLogin             = require('./routes/V2/login/login');
    const userDataBDE           = require('./routes/V2/login/login');
    const userDatas             = require('./routes/V2/workTime/userDatas');
    const userCheckIn           = require('./routes/V2/workTime/userCheckIn');
    const userCheckOut          = require('./routes/V2/workTime/userCheckOut');
    const userOuterWork         = require('./routes/V2/workTime/userOuterWork');
    const userAttendance        = require('./routes/V2/workTime/userAttendance');
    const prodScanner           = require('./routes/V2/IoTScanner/productScanner');
    const accessControl         = require('./routes/V2/accessControl/accessControl');
    const assetCollectorRouter  = require('./routes/V2/assetCollector/assetCollector');
    const warehouseBooking      = require('./routes/V2/warehouseBooking/warehouseBooking');
    const workOrderBDE          = require('./routes/V2/productionManagement/production/bde/bde');
    const prodList              = require('./routes/V2/productionManagement/production/prodList/prodList');
    const stockInfo             = require('./routes/V2/productionManagement/materialManagement/stock/stock');
    const workOrderData         = require('./routes/V2/productionManagement/production/workOrder/workOrder');
    const articleDocs           = require('./routes/V2/productionManagement/production/articleDocs/articleDocs');
    const materialPlanner       = require('./routes/V2/productionManagement/materialManagement/materialPlanner/materialPlanner');
    const materialBooking       = require('./routes/V2/productionManagement/materialManagement/materialBooking/materialBooking');

    app.get('/', (req, res) => {
        res.send(`<h1>Home page</h1><h3>${process.env.PORT}</h3>`);
    });

    app.use('/hr-image', HRImageRouter);
    app.use('/asset-collector', assetCollectorRouter);
    app.use('/api/v2/article-docs', articleDocs);
    app.use('/api/v2/files', files);
    app.use('/api/v2/login', userLogin);
    app.use('/api/v2/get-user-bde', userDataBDE);
    app.use('/api/v2/material-plan', materialPlanner);
    app.use('/api/v2/stock-info', stockInfo);
    app.use('/api/v2/prod-center', prodList);
    app.use('/api/v2/get-user', userDatas);
    app.use('/api/v2/attendance', userAttendance);
    app.use('/api/v2/checkin', userCheckIn);
    app.use('/api/v2/checkout', userCheckOut);
    app.use('/api/v2/outerwork', userOuterWork);
    app.use('/api/v2/work-order-data', workOrderData);
    app.use('/api/v2/work-order', workOrderBDE);
    app.use('/api/v2/iot-scanner', prodScanner);
    app.use('/api/v2/material-booking-article', materialBooking);
    app.use('/api/v2/warehouse-booking', warehouseBooking);
    app.use('/api/v2/access-control', accessControl);

    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} started on port ${PORT}`);
    });
}