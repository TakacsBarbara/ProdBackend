import express, { Request, Response } from 'express';
import axios from 'axios';

const stockInfoURL: string = process.env.NEW_ABAS_BESTAND_URL ? process.env.NEW_ABAS_BESTAND_URL : ''; 
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

const getStockInfo = (req: Request, res: Response) => {

    interface Action {
        _type: string;
        fieldName: string;
        value: any;
    }
      
    const action: Action[] = [];

    const queryParams = {
        article: {
          fieldName: 'artikel',
          value: req.query.article,
        },
        locker: {
          fieldName: 'klager',
          value: req.query.locker,
        },
        lockerPlace: {
          fieldName: 'klplatz',
          value: req.query.lockerPlace,
        },
        isZero: {
            fieldName: 'nullmge',
            value: req.query.isZero ? req.query.isZero : false
        },
        isCollection: {
            fieldName: 'verdichten',
            value: req.query.isCollection ? req.query.isCollection : false
        },
        isPackDev: {
            fieldName: 'packm',
            value: req.query.isPackDev ? req.query.isPackDev : false
        },
        isNegative: {
            fieldName: 'nurnegativ',
            value: req.query.isNegative ? req.query.isNegative : false
        },
    };

    Object.keys(queryParams).forEach(param => {
        const { fieldName, value } = queryParams[param as keyof typeof queryParams];

        if (value) {
          action.push({
            _type: 'SetFieldValue',
            fieldName,
            value,
          });
        }
    });

    const body = JSON.stringify({
        "actions": [
            ...action,
            {
                "_type": "SetFieldValue",
                "fieldName": "details",
                "value": false
            },
            {
                "_type": "SetFieldValue",
                "fieldName": "bstart"
            }
        ],
        "headFields": "bez",        
        "tableFields": "lager, lplatz, dispo, lemge, leinheit, charge, gebmge, geinheit, lzu, lab, verw"
    });

    axios.post(stockInfoURL, body, options_POST)
        .then(response => {
            let data = {
                description:    response['data']['content']['data']['head']['fields']['bez']['text'],
                table:          response['data']['content']['data']['table'] != null ? createStockInfoTable(response['data']['content']['data']['table']) : null
            }
            res.send(data);
        })
        .catch(error => {
            console.log(error.stack);
            res.send([]);
        });
};

interface StockInfo {
    raktar: string;
    rhely: string;
    diszpo: string;
    osszkeszlet: any;
    raktaregyseg: string;
    sarzs: string;
    felhasznalas: any;
    kiszereleskeszlet: any;
    kiszerelesegyseg: any;
    bevet: any;
    kivet: any;
};

function createStockInfoTable(data: any[]): StockInfo[] {
    const table: StockInfo[] = [];

    data.forEach(element => {
        table.push({
            raktar:             element.fields.lager.text,
            rhely:              element.fields.lplatz.text,    
            diszpo:             element.fields.dispo.value,
            osszkeszlet:        element.fields.lemge.text,
            raktaregyseg:       element.fields.leinheit.text,
            sarzs:              element.fields.charge.text,
            felhasznalas:       element.fields.verw.value,
            kiszereleskeszlet:  element.fields.gebmge.text,
            kiszerelesegyseg:   element.fields.geinheit.text,
            bevet:              element.fields.lzu.text,
            kivet:              element.fields.lab.text,
        });
    });

    return table;
};

module.exports = {
    getStockInfo
};
