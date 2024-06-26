import express, { Request, Response } from 'express';
import axios from 'axios';

const materialBookingURL: string = process.env.NEW_ABAS_MATERIAL_BOOKING_URL ? process.env.NEW_ABAS_MATERIAL_BOOKING_URL : '';
const auth = 'Basic ' + Buffer.from(process.env.NEW_ABAS_USER || '').toString('base64');
const options_POST = {
    method: 'POST',
    headers: {
        'Authorization':    auth,
        'Content-Type':     'application/json',
        'Connection':       'keep-alive',
        'Accept':           '*/*',
        'Accept-Encoding':  'gzip, deflate, br',
        'Accept-Language':  'HU',
        'Cache-Control':    'no-cache'
    }
};

const saveBooking = async (req: Request, res: Response) => {

    const quantityString: string = req.body.quantity;
    const standardizedQuantity: string = quantityString.replace('.', ',');

    const body = JSON.stringify({
        "actions": [
            {
                "_type": "SetFieldValue",
                "fieldName": "artikel",
                "value": req.body.qrCodeDataArticle
            },
            {
                "_type": "SetFieldValue",
                "fieldName": "buart",
                "value": "Átkönyvelés"
            },
            {
                "_type": "SetFieldValue",
                "fieldName": "beleg",
                "value": req.body.userId
            },
            {
                "_type": "SetFieldValue",
                "fieldName": "beldat",
                "value": "."
            },
            {
                "_type": "SetFieldValue",
                "fieldName": "mge",
                "value": standardizedQuantity,
                "rowSpec": "1"
            },
            {
                "_type": "SetFieldValue",
                "fieldName": "platz",
                "value": req.body.qrCodeDataActLockerPlace,
                "rowSpec": "1"
            },
            {
                "_type": "SetFieldValue",
                "fieldName": "platz2",
                "value": req.body.qrCodeDataTargetLockerPlace,
                "rowSpec": "1"
            }
        ]
    });

    try {
        const workingSet = await axios.post(materialBookingURL, {}, {
            method: 'POST',
            headers: {
                'Authorization':    auth,
                'Content-Type':     'application/json',
                'Connection':       'keep-alive',
                'Accept':           '*/*',
                'Accept-Encoding':  'gzip, deflate, br',
                'Accept-Language':  'HU'
            },
            params: {
                filterHeadFields: 'artikel,beleg,buart,beldat',
                filterTableFields: 'mge,platz,platz2'
            }
        });

        if (workingSet.status === 200 || workingSet.status === 201) {

            const workingSetURL = `${process.env.NEW_ABAS_BASE_URL}${workingSet.data.content.data.meta.link.href}`;
            const initPost = await axios.post(workingSetURL, body,  options_POST);

            if (initPost.status === 200) {

                const commitPost = await axios.post(`${workingSetURL}/commands/COMMIT`, {}, options_POST);

                if (commitPost.status === 200) {

                    const closePost = await axios.post(`${process.env.NEW_ABAS_BASE_URL}${process.env.REFERRED_ERP}${initPost.data.content.data.meta.workingSetId}/commands/CLOSE`, {}, options_POST);
                    
                    if (closePost.status === 200) {
                        res.send({response: `OK`});
                    } else {
                        res.status(400).send("Failed to close working set");
                    }
                } else {
                    res.status(400).send("Failed to commit changes");
                }
            } else {
                res.status(400).send("Failed to initialize working set");
            }
        } else {
            res.status(400).send("Failed to fetch working set");
        }
	} catch (error: any) {
        console.error("Error: ", error.message);
        res.status(500).send({ response: error.message });
    };
}

module.exports = {
    saveBooking
}