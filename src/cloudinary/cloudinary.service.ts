import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import bufferToStream from 'buffer-to-stream';

@Injectable()
export class CloudinaryService {
    uploadImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                { folder: 'crack_assets' }, // Opsional: nama folder di Cloudinary
                (error, result) => {
                    if (error) return reject(error);
                    if (result) return resolve(result);
                    reject(new Error('Upload failed, no result returned from Cloudinary'));
                },
            );

            // Ubah buffer file menjadi stream lalu kirim ke Cloudinary
            const stream = bufferToStream(file.buffer);
            stream.pipe(upload);
        });
    }
}