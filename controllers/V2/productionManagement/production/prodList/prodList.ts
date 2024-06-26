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

const getProductionList = (req: Request, res: Response) => {

    interface Action {
        _type: string;
        fieldName: string;
        value: any;
    }
      
    const action: Action[] = [];

    const queryParams = {
        factoryMandate: {
            fieldName: 'kba',
            value: req.query.factoryMandate,
        },
        article: {
            fieldName: 'kart',
            value: req.query.article,
        },
        customer: {
            fieldName: 'yvevo',
            value: req.query.customer,
        },
        locker: {
            fieldName: 'kabtlg',
            value: req.query.locker,
        },
        consumption: {
            fieldName: 'kverw',
            value: req.query.consumption,
        },
        startDateFrom: {
            fieldName: 'vom',
            value: req.query.startDateFrom,
        },
        startDateTo: {
            fieldName: 'bis',
            value: req.query.startDateTo,
        },
        endDateFrom: {
            fieldName: 'vom2',
            value: req.query.endDateFrom,
        },
        endDateTo: {
            fieldName: 'bis2',
            value: req.query.endDateTo,
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

    // Ha null értékű üzemi megbízások is kellenek, akkor bba-t ki kell venni
    const body = JSON.stringify({
        "actions": [
            ...action,
            {
                "_type": "SetFieldValue",
                "fieldName": "bba",
                "value": "true"
            },
            {
                "_type": "SetFieldValue",
                "fieldName": "bstart"
            }
        ],
        "tableFields": "order, sorder, statusz, tbasisartikel, vorgnachficon, art, verwerbtxt, abtlg, netmge, frgmge, vplgmge, vpbsmge, artle, tsterm, tterm, tfterm, twterm, fix, fixterm"
    });

    axios.post(gyartaskozpontURL, body, options_POST)
    .then( response => {

        interface ResponseData {
            uzemi_megbizas: string;
            uzemi_megbizas_statusz: string;
            statusz_kiir: any;
            bazis_arucikk: any;
            kifuto_arucikk: any;
            arucikk: any;
            info_a_tovabbadashoz: any;
            reszleg: any;
            osszmennyiseg: any;
            atadando_mennyiseg: any;
            rendelkezesre_allo_komponensek_raktaron: any;
            rendelkezesre_allo_komponensek_beszerzesen_keresztul: any;
            egyseg: any;
            kezdo_hatarido: any;
            befejezesi_hatarido: any;
            legkorabbi_befejezesi_hatarido: any;
            cel_hatarido: any;
            folyamat_fixalasa: any;
            hatarido_fixalva: any;
        };

        const data: ResponseData[] = [];

        if (response['data']['content']['data']['table']) {

            response['data']['content']['data']['table'].forEach((element: any) => {

                data.push({
                    uzemi_megbizas:                                       element.fields.order.text,
                    uzemi_megbizas_statusz:                               element.fields.sorder.text,
                    statusz_kiir:                                         element.fields.statusz.text,
                    bazis_arucikk:                                        element.fields.tbasisartikel.text,
                    kifuto_arucikk:                                       element.fields.vorgnachficon.text,
                    arucikk:                                              element.fields.art.text,
                    info_a_tovabbadashoz:                                 element.fields.verwerbtxt.text,
                    reszleg:                                              element.fields.abtlg.text,
                    osszmennyiseg:                                        element.fields.netmge.text,
                    atadando_mennyiseg:                                   element.fields.frgmge.text,
                    rendelkezesre_allo_komponensek_raktaron:              element.fields.vplgmge.text,
                    rendelkezesre_allo_komponensek_beszerzesen_keresztul: element.fields.vpbsmge.text,
                    egyseg:                                               element.fields.artle.text,
                    kezdo_hatarido:                                       element.fields.tsterm.text,
                    befejezesi_hatarido:                                  element.fields.tterm.text,
                    legkorabbi_befejezesi_hatarido:                       element.fields.tfterm.text,
                    cel_hatarido:                                         element.fields.twterm.text,
                    folyamat_fixalasa:                                    element.fields.fix.text,
                    hatarido_fixalva:                                     element.fields.fixterm.text
                });
            });

            console.log(data);
            res.send(data);
        } else {
            console.log("Table has no elements!");
            res.send(data);
        }

    })
    .catch(err => {
        console.log(err);
        res.send([]);
    });
};

module.exports = {
    getProductionList
};

