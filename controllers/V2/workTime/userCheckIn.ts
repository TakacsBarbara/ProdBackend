import express, { Request, Response } from 'express';
import axios from 'axios';

const attendanceURL: string = process.env.ABAS_GET_ATTENDANCE_URL ? process.env.ABAS_GET_ATTENDANCE_URL : '';
const auth = 'Basic ' + Buffer.from(process.env.NEW_ABAS_USER || '').toString('base64');

const checkInUser = (req: Request, res: Response) => {
    const id = req.params.id;

    const body = JSON.stringify({
        "actions": [
            {
                "_type": "SetFieldValue",
                "fieldName": "mitarb",
                "value": req.params.id
            },
            {
                "_type": "SetFieldValue",
                "fieldName": "kommt"
            }
        ],
        "headFields": "mitarbname, bdestatus, bdetext, kommt, geht, dienstgang"
    });

    axios.post(attendanceURL, body, {
        method: 'POST',
        headers: {
            'Authorization':    auth,
            'Content-Type':     'application/json',
            'Connection':       'keep-alive',
            'Accept':           '*/*',
            'Accept-Encoding':  'gzip, deflate, br',
            'Accept-Language':  'HU'
        }
    })
    .then(response => {
        const data = {
            bdeStatus:      response['data']['content']['data']['head']['fields']['bdestatus']['value'],
            bdeText:        response['data']['content']['data']['head']['fields']['bdetext']['value'],
            checkIn:        response['data']['content']['data']['head']['fields']['kommt']['value'],
            checkOut:       response['data']['content']['data']['head']['fields']['geht']['value'],
            outsideWork:    response['data']['content']['data']['head']['fields']['dienstgang']['value']
        }
        console.log(data);
        res.status(200).send(data);
    })
    .catch(error => {
        console.log(error);
        res.status(400).send(error);
    });
}

module.exports = {
    checkInUser
};