import express, { Request, Response } from 'express';
import axios from 'axios';

const doorDataURL: string = process.env.NEW_ABAS_DOOR_DATA_URL || '';

const auth = 'Basic ' + Buffer.from(process.env.NEW_ABAS_USER || '').toString('base64');
let options_POST = {
    method: 'POST',
    headers: {
        'Authorization':    auth,
        'Content-Type':     'application/abas.objects+json',
        'Connection':       'keep-alive',
        'Accept':           '*/*',
        'Accept-Encoding':  'gzip, deflate, br'
    }
}

const accessControl = (req: Request, res: Response) => {
    let body = JSON.stringify({
        "actions" : [
            {
                "_type":        "SetFieldValue",
                "fieldName":    "ydoor",
                "value":        req.params.doorID
            },
            {
                "_type": "SetFieldValue",
                "fieldName": "bstart"
            }
        ],
        "headFields":   "ydoor, yhnyit, yhzar, yknyit, ykzar, ysznyit, yszzar, ycsnyit, ycszar, ypnyit, ypzar, yszonyit, yszozar, yvnyit, yvzar, ysynctime",
        "tableFields":  "ydolg, yrfid, ythnyit, ythzar, ytknyit, ytkzar, ytsznyit, ytszzar, ytcsnyit, ytcszar, ytpnyit, ytpzar, ytszonyit, ytszozar, ytvnyit, ytvzar, yrootcard"
    });

    axios.post(doorDataURL, body, options_POST)
        .then(response => {
            let table: any[] = [];

            response['data']['content']['data']['table'].forEach((element: any) => {
                table.push({
                    worker:     element['fields']['ydolg']['text'],
                    workerCard: element['fields']['yrfid']['value'],
                    yhnyit:     element['fields']['ythnyit']['value'],
                    yhzar:      element['fields']['ythzar']['value'],
                    yknyit:     element['fields']['ytknyit']['value'], 
                    ykzar:      element['fields']['ytkzar']['value'],
                    ysznyit:    element['fields']['ytsznyit']['value'],
                    yszzar:     element['fields']['ytszzar']['value'],
                    ycsnyit:    element['fields']['ytcsnyit']['value'],
                    ycszar:     element['fields']['ytcszar']['value'],
                    ypnyit:     element['fields']['ytpnyit']['value'],
                    ypzar:      element['fields']['ytpzar']['value'],
                    yszonyit:   element['fields']['ytszonyit']['value'],
                    yszozar:    element['fields']['ytszozar']['value'],
                    yvnyit:     element['fields']['ytvnyit']['value'],
                    yvzar:      element['fields']['ytvzar']['value'],
                    yrootcard:  element['fields']['yrootcard']['value'],
                })
            });
            
            let data = {
                ydoor:      response['data']['content']['data']['head']['fields']['ydoor']['text'],
                yhnyit:     response['data']['content']['data']['head']['fields']['yhnyit']['value'],
                yhzar:      response['data']['content']['data']['head']['fields']['yhzar']['value'], 
                yknyit:     response['data']['content']['data']['head']['fields']['yknyit']['value'], 
                ykzar:      response['data']['content']['data']['head']['fields']['ykzar']['value'], 
                ysznyit:    response['data']['content']['data']['head']['fields']['ysznyit']['value'], 
                yszzar:     response['data']['content']['data']['head']['fields']['yszzar']['value'], 
                ycsnyit:    response['data']['content']['data']['head']['fields']['ycsnyit']['value'],
                ycszar:     response['data']['content']['data']['head']['fields']['ycszar']['value'], 
                ypnyit:     response['data']['content']['data']['head']['fields']['ypnyit']['value'], 
                ypzar:      response['data']['content']['data']['head']['fields']['ypzar']['value'], 
                yszonyit:   response['data']['content']['data']['head']['fields']['yszonyit']['value'], 
                yszozar:    response['data']['content']['data']['head']['fields']['yszozar']['value'], 
                yvnyit:     response['data']['content']['data']['head']['fields']['yvnyit']['value'], 
                yvzar:      response['data']['content']['data']['head']['fields']['yvzar']['value'],
                ysynctime:  response['data']['content']['data']['head']['fields']['ysynctime']['value'],
                data: table
            }

            res.json(data);
        }).catch((error: any) => {
            res.status(500).json(error);
        });
}

module.exports = {
    accessControl
};