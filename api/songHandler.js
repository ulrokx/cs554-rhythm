import fs from 'fs';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';
import path from 'path';


class songHandler{
    constructor(storePath){
        this.storagePath = path.resolve(storePath) + "/";
    }

    async storeFile(userId, fileObj){
        const extension = path.extname(fileObj.name);
        const fileName = `${userId}-${Date.now().toString(36)}`;
        const newFilePath = path.join(this.storagePath, fileName + extension);
        await new Promise(res => fileObj.mv(newFilePath, res));
        return {fullPath: newFilePath, name: fileName, ext: extension};
    }

    async convertFile({fullPath, name, ext}){
        if(ext === ".mp3") return name + ext;

        //Convert the file with ffmpeg
        const newName = name + '.mp3';
        const newPath = path.join(this.storagePath, newName);
        const converter = spawn(ffmpegPath,["-i", fullPath, "-vn", newPath]);
        await new Promise(res => {
            converter.on('close', res);
        });
        //Remove old file
        fs.rmSync(fullPath);
        return {newName, fullPath: newPath};
    }
}

export default songHandler;