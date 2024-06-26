import express, { Request, Response } from 'express';
import axios from 'axios';

const plankarteURL: string = process.env.NEW_ABAS_PLANKARTE_URL ? process.env.NEW_ABAS_PLANKARTE_URL : '';
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

const getMaterialPlanner = (req: Request, res: Response) => {
    console.log(req.params.article);

    const body = JSON.stringify({
        "actions": [
            {
                "_type": "SetFieldValue",
                "fieldName": "kart",
                "value": req.params.article
            },
            {
                "_type": "SetFieldValue",
                "fieldName": "bstart"
            }

        ],
        "headFields": "kartname",        
        "tableFields": "woche, tterm, twterm, fterm, zugang, abgang, verfueg, art, namebspr, verw, vkopf, fix"
    });

    axios.post(plankarteURL, body, options_POST)
        .then(response => {
            let data = {
                description:    response['data']['content']['data']['head']['fields']['kartname']['text'],
                table:          response['data']['content']['data']['table'] != null ? createMaterialPlanTable(response['data']['content']['data']['table']) : null
            };

            res.send(data);
        })
        .catch(error => {
            console.log(error);
            res.send({});
        });
}

function createMaterialPlanTable(data: any) {
    const table: any[] = [];

    data.forEach((element: { fields: { woche: { text: any; }; tterm: { text: any; }; twterm: { text: any; }; fterm: { text: any; }; zugang: { text: any; }; abgang: { text: any; }; verfueg: { text: any; }; art: { text: any; }; namebspr: { text: any; }; verw: { value: any; }; vkopf: { text: any; }; fix: { value: any; }; }; }) => {
        table.push({
            het:                        element.fields.woche.text,
            tenyHI:                     element.fields.tterm.text,
            celHI:                      element.fields.twterm.text,
            legkorabbiHI:               element.fields.fterm.text,
            bevet:                      element.fields.zugang.text,
            kivet:                      element.fields.abgang.text,
            rendelkezesreAll:           element.fields.verfueg.text,
            reszegyseg:                 element.fields.art.text,
            reszegysegMegnevezese:      element.fields.namebspr.text,
            felhasznalas:               element.fields.verw.value,
            folyamat:                   element.fields.vkopf.text,
            fix:                        element.fields.fix.value
        });
    });

    return table;
}

module.exports = {
    getMaterialPlanner
};