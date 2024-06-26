import express, { Request, Response } from 'express';
import axios from 'axios';

const gyartaskozpontURL: string = process.env.NEW_ABAS_GYARTASKOZP_URL ? process.env.NEW_ABAS_GYARTASKOZP_URL : '';
const auth = 'Basic ' + Buffer.from(process.env.NEW_ABAS_USER || '').toString('base64');
const options_POST = {
    headers: {
        'Authorization':    auth,
        'Content-Type':     'application/json',
        'Connection':       'keep-alive',
        'Accept':           '*/*',
        'Accept-Encoding':  'gzip, deflate, br',
        'Accept-Language':  'HU'
    }
};

const getWOData = (req:Request, res: Response) => {
    console.log(req.params);

    const body = JSON.stringify({
        "actions": [
            {
                "_type": "SetFieldValue",
                "fieldName": "kba",
                "value": req.params.workOrderNumber
            },
            {
               "_type": "SetFieldValue",
               "fieldName": "detail",
               "value": true
            },
            {
                "_type": "SetFieldValue",
                "fieldName": "bstart"
            },
        ],
        "tableFields": "art, artbez, mge, frgmge, tsterm, tterm, order, artle, vzeit, art^sach, vorgang^lge, vorgang^lme, vorgang^breite, vorgang^bme, vorgang^anzahl, vorgang^mle"
    });

    axios.post(gyartaskozpontURL, body, options_POST)
    .then(response => {
        console.log(response['data']['content']['data']['table'][0]);

        res.send({data: {
                article:                response['data']['content']['data']['table'][0]['fields']['art']['text'],
                articleDescription:     response['data']['content']['data']['table'][0]['fields']['artbez']['text'],
                quantity:               response['data']['content']['data']['table'][0]['fields']['mge']['text'],
                quantityLeft:           response['data']['content']['data']['table'][0]['fields']['frgmge']['text'],
                startDate:              response['data']['content']['data']['table'][0]['fields']['tsterm']['text'],
                endDate:                response['data']['content']['data']['table'][0]['fields']['tterm']['text'],
                BOM:                    createMaterialPlanTable(response['data']['content']['data']['table'])
            }
        });
    })
    .catch(error => {
        console.log(error.stack);
        res.send([]);
    });
}

interface Fields {
    order: { text: any };
    art: { text: any };
    artbez: { text: any }; 
    mge: { value: any }; 
    artle: { text: any }; 
    vzeit: { text: any };
    'vorgang^lge': { text: any };
    'vorgang^lme': { text: any };
    'vorgang^breite': { text: any };
    'vorgang^bme': { text: any };
    'vorgang^anzahl': { text: any };
    'vorgang^mle': { text: any };
}
  
function createMaterialPlanTable(data: { fields: Fields }[]) {
    const table: any[] = [];

    data.forEach((element) => {
        table.push({
            workOrderNumber:    element.fields.order.text,
            article:            element.fields.art.text,
            articleDescription: element.fields.artbez.text,
            quantity:           element.fields.mge.value,
            unit:               element.fields.artle.text,
            time:               element.fields.vzeit.text,
            prodTimeMin:        element.fields['vorgang^lge'].text,
            prodTimeMinUnit:    element.fields['vorgang^lme'].text,
            prodTimeSec:        element.fields['vorgang^breite'].text,
            prodTimeSecUnit:    element.fields['vorgang^bme'].text,
            prodQuantity:       element.fields['vorgang^anzahl'].text,
            prodUnit:           element.fields['vorgang^mle'].text
        });
    });

    return table;
}

module.exports = {
    getWOData
};