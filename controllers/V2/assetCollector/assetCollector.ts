import express, { Request, Response } from 'express';
import * as formidable from 'formidable';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';

const saveAssetDatas = (req: Request, res: Response) => {
    
    const form = new formidable.IncomingForm();

    form.parse(req, (err: any, fields: any, files: any) => {

        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Oops! Something went wrong!' });
            return;
        }

        const qrCode = fields.code[0];

        const saveFile = (fieldName: string, fileName: string) => {

            let actFile = files[fieldName];

            try {
                const data = fs.readFileSync(actFile[0].filepath);
                fs.writeFileSync(`${process.env.ASSET_NEW_PATH}/${fileName}`, data);
            } catch (error) {
                
                switch ((error as { code: string }).code) {
                    case 'ENOENT':
                        res.status(StatusCodes.NOT_FOUND).json({ error: 'File not found' });
                        break;
                    case 'EEXIST':
                        res.status(StatusCodes.CONFLICT).json({ error: 'File conflict' });
                        break;
                    default:
                        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Server error' });
                }
            }
        };

        for (let i = 1; i <= 5; i++) {
            let actFile = files[`file${i}`];

            if (actFile && actFile[0].size > 0) {
                let fieldName = `file${i}`;
                let fileName = `${qrCode}_${i}.jpg`;
                saveFile(fieldName, fileName);
            }
        }
    
        const txtFileName = `${qrCode}.txt`;
        const txtFileContent = `${qrCode}\n${fields.place}\n${fields.note}\n`;
    
        fs.writeFileSync(`${process.env.ASSET_NEW_PATH}/${txtFileName}`, txtFileContent);
    
        res.status(200).json({ msg: 'OK' });
      });
}

module.exports = {
    saveAssetDatas
};