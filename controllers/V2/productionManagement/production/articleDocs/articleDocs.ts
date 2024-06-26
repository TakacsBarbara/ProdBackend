import express, { Request, Response } from 'express';
import * as formidable from 'formidable';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const rawMaterial = [
    {folder: "URL", fileName: 'url'},
    {folder: "Datasheet", fileName: 'ds1'},
    {folder: "Datasheet", fileName: 'ds2'},
    {folder: "Datasheet", fileName: 'cat'},
    {folder: "Drawing", fileName: 'prodspec'},
    {folder: "Drawing", fileName: 'atb'},
    {folder: "CAD", fileName: 'cad'},
    {folder: "3D", fileName: 'm3d'},
    {folder: "QM", fileName: 'baell'},
    {folder: "Certif", fileName: 'msds'},
    {folder: "Certif", fileName: 'reach'},
    {folder: "Certif", fileName: 'rohs'},
];

const finishedProd = [
    {folder: "Cdwg", fileName: 'cdwg1'},
    {folder: "Drawing", fileName: 'cdwg2'},
    {folder: "Comb", fileName: 'cplist'},
    {folder: "Adwg", fileName: 'adwg'},
    {folder: "Technology", fileName: 'torzslap'},
    {folder: "Cutlist", fileName: 'cutlist'},
    {folder: "Controlplan", fileName: 'cplan'},
    {folder: "Packing", fileName: 'packing'},
    {folder: "Cellainfo", fileName: 'cellainfo'},
];

const descriptionRawMaterial = [
    'Alkatrész a gyártó honlapján',
    'Alkatrész adatlapja 1',
    'Alkatrész adatlapja 2',
    'Katalógus',
    'Termék specifikáció',
    'Összeszerelési utasítás',
    'CAD Rajz',
    '3D Modell',
    'Bejövő áru ellenőrzés',
    'MSDS adatlap',
    'REACH nyilatkozat',
    'RoHS nyilatkozat'
];
const descriptionFinishedProd = [
    'Vevői rajz 1', 
    'Vevői rajz 2', 
    'Vevői darabjegyzék', 
    'ACSG rajz', 
    'Jóváhagyási jegyzőkönyv', 
    'Darabolási lista', 
    'Vizsgálati terv',
    'Csomagolái utasítás', 
    'Információ cellagyártáshoz'
];

const getArticleURL: string = process.env.ABAS_GET_ARTICLE ? process.env.ABAS_GET_ARTICLE : '';
const saveArticleFilesURL: string = process.env.ARTICLE_SAVE_FILES ? process.env.ARTICLE_SAVE_FILES : '';
const auth = 'Basic ' + Buffer.from(process.env.NEW_ABAS_USER || '').toString('base64');

const renderPage = (req: Request, res: Response) => {
    const { userid, articleid, category } = req.query;
    res.json({userID: userid, articleID: articleid, category: category});
}

const saveDocs = (req: Request, res: Response) => {
    let form = new formidable.IncomingForm();
    let titles: any[] = [];
    let successMessages: any = [];
    let errorMessages: any = [];

    form.parse(req, (err: any, fields: any, files: any) => {

        const articleCategory = fields.category[0];
        const articleID = fields.articleID[0];
        const userID = fields.userID[0];
        const date = getActDate();

        checkFolderExistAndCreate(articleID, saveArticleFilesURL);

        if ((articleCategory === '30000') || (articleCategory === '60000')) {
            const fileContent = fields["url"][0];
            titles = rawMaterial;
            
            if (fileContent !== "null" && typeof fileContent === 'string' && fileContent.trim().length > 0 && fileContent !== null) {

                const filePath = `${saveArticleFilesURL}/${articleID}/${titles[0].folder}/${articleID}_${userID}_${date}_${titles[0].fileName}.txt`;
    
                checkFolderExistAndCreate(titles[0].folder, `${saveArticleFilesURL}/${articleID}`);

                const savedFiles = getFileNamesInFolder(`${saveArticleFilesURL}/${articleID}/${titles[0].folder}`);

                if (savedFiles.length > 0) {

                    savedFiles.map( file => {
                        if (file.endsWith('.txt')) {
                            const fileNameWithoutExtension = file.slice(0, file.lastIndexOf('.'));
                            const archivFolderPath = `${saveArticleFilesURL}/${articleID}/${titles[0].folder}`;
                            checkFolderExistAndCreate('Archiv', archivFolderPath);
            
                            const filesCount = countFilesInFolder(`${saveArticleFilesURL}/${articleID}/${titles[0].folder}/Archiv`);
                            const prevPath = `${saveArticleFilesURL}/${articleID}/${titles[0].folder}/${file}`;
                            const newPath =  `${saveArticleFilesURL}/${articleID}/${titles[0].folder}/Archiv/${fileNameWithoutExtension}_v${filesCount+1}.txt`;

                            fs.renameSync(prevPath, newPath);
                        }
                    });
                }
    
                fs.writeFile(filePath, fileContent, (err) => {
                    if (err) {
                        errorMessages.push('Error creating file:', err);
                    } else {
                        successMessages.push('Text file created successfully:', filePath);
                    }
                });
            }
        } else {
            titles = finishedProd;
        }
        
        for (const key in files) {
            
            const fileList = files[key];
            
            fileList.forEach((file: any, index: number) => {
                const fileExtention = getFileExtension(file.originalFilename);
                const [, fileNum] = key.split('_'); 

                checkFolderExistAndCreate(titles[parseInt(fileNum)].folder, `${saveArticleFilesURL}/${articleID}`);

                const filePath = `${saveArticleFilesURL}/${articleID}/${titles[parseInt(fileNum)].folder}/${articleID}_${userID}_${date}_${titles[parseInt(fileNum)].fileName}.${fileExtention}`;

                const savedFiles = getFileNamesInFolder(`${saveArticleFilesURL}/${articleID}/${titles[parseInt(fileNum)].folder}`);
                
                if (savedFiles.length > 0) {

                    const matchingFile = savedFiles.find(file => file.includes(titles[parseInt(fileNum)].fileName));

                    if (matchingFile) {
                        const oldFileExtention = getFileExtension(matchingFile);
                        const fileNameWithoutExtension = matchingFile.slice(0, matchingFile.lastIndexOf('.'));
                        const archivFolderPath = `${saveArticleFilesURL}/${articleID}/${titles[parseInt(fileNum)].folder}`;
                        checkFolderExistAndCreate('Archiv', archivFolderPath);
        
                        const filesCount = countFilesInFolder(`${saveArticleFilesURL}/${articleID}/${titles[parseInt(fileNum)].folder}/Archiv`);
                        const prevPath = `${saveArticleFilesURL}/${articleID}/${titles[parseInt(fileNum)].folder}/${matchingFile}`;
                        const newPath =  `${saveArticleFilesURL}/${articleID}/${titles[parseInt(fileNum)].folder}/Archiv/${fileNameWithoutExtension}_v${filesCount+1}.${oldFileExtention}`;

                        fs.renameSync(prevPath, newPath);
                    }
                }

                const oldPath1 = file.filepath;
                const newPath1 = filePath;

                if (file.size > 0) {
                    try {
                        const data = fs.readFileSync(oldPath1);
                        fs.writeFileSync(newPath1, data);
                        successMessages.push(`File saved: ${newPath1}`);
                    } catch (error: any) {
                        console.log(error);
                        switch (error.code) {
                            case 'ENOENT':
                                errorMessages.push(`File not found: ${oldPath1}`);
                                break;
                            case 'EEXIST':
                                errorMessages.push(`File conflict: ${newPath1}`);
                                break;
                            default:
                                errorMessages.push(`Server error: ${error.message}`);
                        }
                    }
                }
            });
        }

        if (errorMessages.length > 0) {
            res.status(500).json({ errors: errorMessages });
        } else {
            res.status(200).json({ success: successMessages });
        }
    });
}

const getArticle = (req: Request, res: Response) => {
    const articleID = req.params.articleID;

    axios.get(getArticleURL, {
        method: 'GET',
        headers: {
            'Authorization':    auth,
            'Content-Type':     'application/json',
            'Connection':       'keep-alive',
            'Accept':           '*/*',
            'Accept-Encoding':  'gzip, deflate, br',
            'Accept-Language':  'HU'
        },
        params: {
            criteria: `nummer=${articleID}`,
            headFields: 'sucherw'
        }
    })
    .then(response => {
        const data = {
            articleName: response['data']['content']['data']['erpDataObjects'][0]['head']['fields']['sucherw']['value']
        };
        res.status(200).send(data);
    })
    .catch(error => {
        const data = {};
        console.log(error);
        res.status(400).send(data);
    });
}

const getFiles = async (req: Request, res: Response) => {
    const articleID = req.params.articleID;
    const category = req.params.category;
    const data: any[] = [];
    checkFolderExistAndCreate(articleID, saveArticleFilesURL);
    const folderExist = checkFolderExist(articleID, saveArticleFilesURL);

    if (folderExist) {
        const titles: any[] = ((category === '30000') || (category === '60000')) ? rawMaterial : finishedProd;
        let index = 0;
        
        try {
            for (const title of titles) {

                if (checkFolderExist(title.folder, `${saveArticleFilesURL}/${articleID}`)) {
                    const folderFilesNames = getFileNamesInFolder(`${saveArticleFilesURL}/${articleID}/${title.folder}`);
    
                    for (const folderFileName of folderFilesNames) {
                        if (title.fileName === getPartOfSavedFilesName(folderFileName)) {
        
                            const descriptions: string[] = ((category === '30000') || (category === '60000')) ? descriptionRawMaterial : descriptionFinishedProd;
        
                            try {
                                data.push({
                                    description: descriptions[index],
                                    folder: title.folder,
                                    fileName: folderFileName
                                });
            
                                if ((category === '30000') || (category === '60000')) {
                                    const urlObject = data.find(item => item.folder === 'URL');

                                    if (urlObject && (title.folder === 'URL')) {
                                        try {
                                            const objData = await fs.promises.readFile(`${saveArticleFilesURL}/${articleID}/${title.folder}/${urlObject.fileName}`, 'utf8');
                                            urlObject.fileName = objData;
                                        } catch (err) {
                                            console.error('Error reading file:', err);
                                        }
                                    }
                                }
                            } catch(error: any) {
                                console.log(error);
                                res.send(error);
                            }

                            break;
                        }
                    }
                }
                index = index+1;
            };
            res.status(200).send(data);
        } catch(error: any) {
            console.log(error);
            res.status(400).send([]);
        }
    } else {
        res.status(404).json({ error: 'Folder does not exist' });
    }
}

// Helper functions

const getPartOfSavedFilesName = (fileName: string) => {
    const startIndex = fileName.lastIndexOf('_') + 1;
    const endIndex = fileName.lastIndexOf('.');

    return fileName.substring(startIndex, endIndex);
    
}

const getFileNamesInFolder = (folderPath: string) => {
    try {
        return fs.readdirSync(folderPath);
    } catch (error) {
        console.error('Error reading folder:', error);
        return [];
    }
};

const checkFolderExistAndCreate = (folderName: string, folderPath: string) => {

    const folderExists = fs.existsSync(path.join(folderPath, folderName));

    if (!folderExists) {
        fs.mkdirSync(path.join(folderPath, folderName), { recursive: true });
        console.log('Folder created successfully:', path.join(folderPath, folderName));
    } else {
        console.log('Folder already exists:', path.join(folderPath, folderName));
    }
}

const checkFolderExist = (folderName: string, folderPath: string) => {

    const folderExists = fs.existsSync(path.join(folderPath, folderName));

    if (!folderExists) {
        return 0;
    } else {
        return 1;
    }
}

const countFilesInFolder = (folderPath: string) => {
    try {
        const files = fs.readdirSync(folderPath);
        return files.length;
    } catch (err) {
        console.error('Error counting files in folder:', err);
        return -1;
    }
};

const getActDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    return `${year}${month}${day}`;
}

const getFileExtension = (filename: string) => {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex !== -1) {
        return filename.substring(lastDotIndex + 1);
    } else {
        return '';
    }
}

module.exports = {
    renderPage,
    saveDocs,
    getArticle,
    getFiles
}