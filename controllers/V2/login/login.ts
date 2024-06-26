import express, { Request, Response } from 'express';
import axios from 'axios';

const getUserURL: string = process.env.ABAS_GET_USER_URL ? process.env.ABAS_GET_USER_URL : '';
const auth = 'Basic ' + Buffer.from(process.env.NEW_ABAS_USER || '').toString('base64');

const getUser = (req: Request, res: Response) => {
    const userID = req.params.id;

    axios.get(getUserURL, {
        method: 'GET',
        headers: {
            'Authorization':    auth,
            'Content-Type':     'application/json',
            'Connection':       'keep-alive',
            'Accept':           '*/*',
            'Accept-Encoding':  'gzip, deflate, br',
            'Accept-Language':  'HU'
        },
        params: {
            criteria: `nummer=${userID}`,
            headFields: 'nummer,namebspr,beruf,foto'
        }
    })
    .then(response => {
        const data = {
            userId:         response['data']['content']['data']['erpDataObjects'][0]['head']['fields']['nummer']['value'],
            userName:       response['data']['content']['data']['erpDataObjects'][0]['head']['fields']['namebspr']['value'],
            position:       response['data']['content']['data']['erpDataObjects'][0]['head']['fields']['beruf']['value'],
            foto:           `${process.env.USER_PROFILE_PICTURE_ROOT}${userID}.jpg`
        }
        res.status(200).send(data);
    })
    .catch(error => {
        const data = {};
        console.log(error);
        res.status(400).send(data);
    });
}

module.exports = {
    getUser
};