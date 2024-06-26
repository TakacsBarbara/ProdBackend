import express, { Request, Response } from 'express';
import axios from 'axios';

const auth = 'Basic ' + Buffer.from(process.env.NEW_ABAS_USER || '').toString('base64');

const book = async (req: Request, res: Response) => {

    try {
        const response = await axios({
            method: 'POST',
            url: process.env.WAREHOUSE_BOOK_URL,
            headers: {
                'Authorization':    auth,
                'Content-Type':     'application/json',
                'Connection':       'keep-alive',
                'Accept':           '*/*',
                'Accept-Encoding':  'gzip, deflate, br',
                'Accept-Language':  'HU'
            },
            data: {
                "initAction": {
                  "_type": "OpenEditor",
                  "tableName": "4:23",
                  "editRefID": `${req.query.id}`,
                  "editAction": "UPDATE"
                },
                "actions" : [
                  { "_type": "SetFieldValue",
                    "fieldName": "ueb",
                    "value": true
                  }
                ],
                "headFields": "uebertr"
            }
        });

        console.log(response['data']['content']['data']);
        res.send('Könyvelve');

    } catch (err: any) {
        console.log(err['response']['data']['content']);
        res.send('error');
    }
}

const get = async (req: Request, res: Response) => {

    try {
        const response = await axios(
            {
                method: 'POST',
                url: process.env.WAREHOUSE_GET_URL,
                headers: {
                    'Authorization':    auth,
                    'Content-Type':     'application/json',
                    'Connection':       'keep-alive',
                    'Accept':           '*/*',
                    'Accept-Encoding':  'gzip, deflate, br',
                    'Accept-Language':  'HU'
                },
                data: {
                    "headFields": "id, uebertr",
                    "criteria": [`nummer=${req.query.id}`]
                }
            }
        )
        res.json(response['data']['content']['data']['erpDataObjects'][0]['head']);

    } catch (error) {
        res.send('error');
    }
}

module.exports = {
    book,
    get
}