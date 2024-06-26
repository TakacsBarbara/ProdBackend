import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const getPic = (req: Request, res: Response) => {
    const data: { fileName: string, path: string }[] = [];
    const directoryPath = `./dist/public/d/Public/Production/${req.params.article}/PIC`;

    const getFile = (directoryPath: any, newArticleNum: any) => {
        fs.readdir(directoryPath, (err: any, files) => {

            if (err) {
                console.error('Error reading directory:', err);
                return;
            }

            files.forEach(file => {
                if (path.basename(file, path.extname(file)).indexOf('qr') > -1) {
                } else {
                    data.push({
                        fileName: path.basename(file, path.extname(file)),
                        path: `${process.env.ARTICLE_FILES_ROOT}${newArticleNum}/PIC/${file}`
                    });
                }
            });
            res.send(data);
        });
    }

    if (fs.existsSync(directoryPath)) {
        getFile(directoryPath, req.params.article);  
    } else {
        const newArticleNum = req.params.article.slice(0, -4);
        const newDirectoryPath = `./dist/public/d/Public/Production/${newArticleNum}/PIC`;
        getFile(newDirectoryPath, newArticleNum);
    }
}

const getCdwg = (req: Request, res: Response) => {
    const data: { fileName: string, path: string }[] = [];
    const directoryPath = `./dist/public/d/Public/Production/${req.params.article}/Cdwg`;

    const getFile = (directoryPath: any, newArticleNum: any) => {
        fs.readdir(directoryPath, (err: any, files) => {

            if (err) {
                console.error('Error reading directory:', err);
                return(res.send([]));
            }

            files.forEach((file, index) => {
                if (!file.toLowerCase().includes('archiv')) {
                    data.push({
                        fileName: "Vevői rajz " + (index + 1),
                        path: `${process.env.ARTICLE_FILES_ROOT}${newArticleNum}/Cdwg/${file}`
                    });
                }
            });
            res.send(data);
        });
    }

    if (fs.existsSync(directoryPath)) {
        getFile(directoryPath, req.params.article);  
    } else {
        const newArticleNum = req.params.article.slice(0, -4);
        const newDirectoryPath = `./dist/public/d/Public/Production/${newArticleNum}/Cdwg`;
        getFile(newDirectoryPath, newArticleNum);
    }
}

const getCutlist = (req: Request, res: Response) => {
    const data: { fileName: string, path: string }[] = [];
    const directoryPath = `./dist/public/d/Public/Production/${req.params.article}/Cutlist`;

    const getFile = (directoryPath: any, newArticleNum: any) => {
        fs.readdir(directoryPath, (err: any, files) => {

            if (err) {
                console.error('Error reading directory:', err);
                return(res.send([]));
            }

            files.forEach((file, index) => {
                if (!file.toLowerCase().includes('archiv')) {
                    data.push({
                        fileName: "Darabolási lista " + (index + 1),
                        path: `${process.env.ARTICLE_FILES_ROOT}${newArticleNum}/Cutlist/${file}`
                    });
                }
            });
            res.send(data);
        });
    }

    if (fs.existsSync(directoryPath)) {
        getFile(directoryPath, req.params.article);  
    } else {
        const newArticleNum = req.params.article.slice(0, -4);
        const newDirectoryPath = `./dist/public/d/Public/Production/${newArticleNum}/Cutlist`;
        getFile(newDirectoryPath, newArticleNum);
    }
}

const getAdwg = (req: Request, res: Response) => {
    const data: { fileName: string, path: string }[] = [];
    const directoryPath = `./dist/public/d/Public/Production/${req.params.article}/Adwg`;

    const getFile = (directoryPath: any, newArticleNum: any) => {
        fs.readdir(directoryPath, (err: any, files) => {

            if (err) {
                console.error('Error reading directory:', err);
                return(res.send([]));
            }

            files.forEach((file, index) => {
                if (!file.toLowerCase().includes('archiv')) {
                    data.push({
                        fileName: "ACSG rajz  " + (index + 1),
                        path: `${process.env.ARTICLE_FILES_ROOT}${newArticleNum}/Adwg/${file}`
                    });
                }
            });
            res.send(data);
        });
    }

    if (fs.existsSync(directoryPath)) {
        getFile(directoryPath, req.params.article);  
    } else {
        const newArticleNum = req.params.article.slice(0, -4);
        const newDirectoryPath = `./dist/public/d/Public/Production/${newArticleNum}/Adwg`;
        getFile(newDirectoryPath, newArticleNum);
    }
}

const getCellainfo = (req: Request, res: Response) => {
    const data: { fileName: string, path: string }[] = [];
    const directoryPath = `./dist/public/d/Public/Production/${req.params.article}/Cellainfo`;

    const getFile = (directoryPath: any, newArticleNum: any) => {
        fs.readdir(directoryPath, (err: any, files) => {

            if (err) {
                console.error('Error reading directory:', err);
                return(res.send([]));
            }

            files.forEach((file, index) => {
                if (!file.toLowerCase().includes('archiv')) {
                    data.push({
                        fileName: "Információ cellagyártáshoz " + (index + 1),
                        path: `${process.env.ARTICLE_FILES_ROOT}${newArticleNum}/Cellainfo/${file}`
                    });
                }
            });
            res.send(data);
        });
    }

    if (fs.existsSync(directoryPath)) {
        getFile(directoryPath, req.params.article);  
    } else {
        const newArticleNum = req.params.article.slice(0, -4);
        const newDirectoryPath = `./dist/public/d/Public/Production/${newArticleNum}/Cellainfo`;
        getFile(newDirectoryPath, newArticleNum);
    }
}

module.exports = {
    getPic,
    getCdwg,
    getCutlist,
    getAdwg,
    getCellainfo
};