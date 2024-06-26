import express, { Request, Response } from 'express';
import axios from 'axios';

const megbizasiIdokURL: string = process.env.NEW_ABAS_MEGBIZASI_IDOK_SCAN_URL ? process.env.NEW_ABAS_MEGBIZASI_IDOK_SCAN_URL : '';
const auth = 'Basic ' + Buffer.from(process.env.NEW_ABAS_USER || '').toString('base64');
const options_POST = {
    headers: {
        'Authorization':    auth,
        'Content-Type':     'application/abas.objects+json',
        'Connection':       'keep-alive',
        'Accept':           '*/*',
        'Accept-Encoding':  'gzip, deflate, br',
        'Accept-Language':  'HU',
        'Cache-Control':    'no-cache'
    }
};

const options_User_POST = {
    headers: {
        'Authorization':    auth,
        'Content-Type':     'application/json',
        'Connection':       'keep-alive',
        'Accept':           '*/*',
        'Accept-Encoding':  'gzip, deflate, br',
        'Accept-Language':  'HU',
        'Cache-Control':    'no-cache, no-store, must-revalidate',
        'Pragma':           'no-cache',
        'Expires':          '0'
    }
};

const getUserData = (req:Request, res: Response) => {

    const body = JSON.stringify({
        "actions": [
            {
                "_type": "SetFieldValue",
                "fieldName": "mitarb",
                "value": req.body.id
            }
        ],
        "headFields": "mitarb, mitarbname",
        "tableFields": "*"
    });

    if (req.body.id) {

        axios.post(megbizasiIdokURL, body, options_User_POST)
        .then(response => {

            const data: { userId: any; username: any; openedWOCount?: any } = {
                userId:     response['data']['content']['data']['head']['fields']['mitarb']['text'],
                username:   response['data']['content']['data']['head']['fields']['mitarbname']['text']
            }

            const tableData = response['data']['content']['data']['table'];
    
            if (tableData && Object.keys(tableData).length > 0) {
                const tableLength = Object.keys(tableData).length;
                data.openedWOCount = tableLength;
            } else {
                data.openedWOCount = 0;
            }
            res.send(data);
        })
        .catch(error => {
            console.log(error);
        });
    }
}

const setNewWOData = async (req:Request, res: Response) => {
    
    if (req.body.userList.length > 0) {
        
        interface User {
            userID:             any;
            username:           string;
            workOrderNumber:    any;
            machineGroup:       number;
            isWorking:          boolean;
            action:             string;
            startDate:          string;
            startTime:          string;
            quantities:         object;
            status:             number;
        }

        if (req.body.isGroup) {
            for (const user of req.body.userList) {
                await processUserAction(user);
            }
        } else if (req.body.userID) {
            const user = req.body.userList.find((user: any) => user.userID === req.body.userID);
            await processUserAction(user);
        }

        res.send({response: 'OK'});

    } else {
        res.send({response: 'User list is empty'});
    }
}

const processUserAction = async (user: any) => {

    const body = JSON.stringify({
        "actions": [
            {
                "_type": "SetFieldValue",
                "fieldName": "mitarb",
                "value": user.userID
            },
            {
                "_type": "SetFieldValue",
                "fieldName": "asnr",
                "value": user.workOrderNumber
            }
        ],
        "headFields": "mitarb, asnr, bdetext",
        "tableFields": "tproduktion, tbeenden"
    });

    if (user.status !== 1) {

        try {

            const response = await axios.post(megbizasiIdokURL, body, options_POST);

            if (response['data']['content']['data']['table'] && Object.keys(response['data']['content']['data']['table']).length <= 2) {
                const startBtnIcon = response['data']['content']['data']['table'][0]['fields']['tproduktion']['value'];
                const stopBtnIcon = response['data']['content']['data']['table'][0]['fields']['tbeenden']['value'];

                const bodyUser = JSON.stringify({
                    "actions": [
                        {
                            "_type": "SetFieldValue",
                            "fieldName": "mitarb",
                            "value": user.userID
                        },
                        {
                            "_type": "SetFieldValue",
                            "fieldName": "asnr",
                            "value": user.workOrderNumber
                        },
                        {
                            "_type": "SetFieldValue",
                            "fieldName": user.action === 'start' && startBtnIcon === 'icon:plus' && stopBtnIcon === '' ? 'tproduktion' : 'tbeenden',
                            "rowSpec": 1
                        }
                    ],
                    "headFields": "bdetext"
                });

                const secondResponse = await axios.post(megbizasiIdokURL, bodyUser, options_POST);
                console.log(secondResponse.data.content.data.head.fields.bdetext);
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("New user added!");
    }
};

module.exports = {
    setNewWOData,
    getUserData
};