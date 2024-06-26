import express, { Request, Response } from 'express';
import * as formidable from 'formidable';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';

const saveImage = (req: Request, res: Response) => {
  
    let form = new formidable.IncomingForm();

    form.parse(req, (err: any, fields: any, files: any) => {
        const qrCode = fields.code[0].replace(/[^0-9]+/g, '0');
        const oldPath1 = files.image[0].filepath;
        const newPath1 = `${process.env.HR_NEW_PATH}/${qrCode}.jpg`;

        if (files.image[0].size > 0) {
            try {
                const data = fs.readFileSync(oldPath1);
                fs.writeFileSync(newPath1, data);
                res.status(200).json({ msg: 'File saved' });
            } catch (error) {
                console.log(error);
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
        }
    });
};

module.exports = {
    saveImage
};