import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const saveProd = (req: Request, res: Response) => {

    const fileName = `${req.body.data[0]}.txt`;
    const filePath = path.join(__dirname, './../../../public/d/Public/ASM_Sarzs/', fileName);

    console.log(filePath);

    fs.writeFile(filePath, JSON.stringify(req.body.data), (err) => {
        if (err) {
            console.error('Error saving file:', err);
            return res.status(500).send('NOK');
        }
        console.log(`Saved: ${fileName}`);
        res.send('OK');
    });
}

module.exports = {
    saveProd
};