import { randomUUID } from 'crypto'

import {
    S3Client,
    CreateBucketCommand,
    HeadBucketCommand, PutObjectCommand, PutBucketCorsCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from 'config';

import logger from './Logger';
import { IConfig } from '../types/config';

/**
 * @class AwsS3
 * @description Service wrapper for AWS S3-compatible storage.
 * Handles bucket initialization, file uploads, and presigned URL generation.
 *
 * @param {IConfig['s3']} s3Config - Configuration object for S3 client (endpoint, credentials, etc.)
 *
 * @property {S3Client} s3 - Main S3 client instance
 * @property {S3Client} s3ForPresign - Secondary client used for generating presigned URLs (adjusted endpoint)
 * @property {string} bucketName - Target S3 bucket name
 * @property {object} s3Config - Stored S3 configuration
 *
 * @method init Initializes the bucket and applies CORS configuration
 * @method getUploadUrl Generates a presigned upload URL and public access URL
 * @method getPublicUrl Returns a public URL for a given object key
 * @method uploadFile Uploads a local file to S3
 */
class AwsS3 {
    private s3
    // TODO: For production usage, remove s3FroPresign and keep only s3.
    // NOTE: It is used to make images available outside of docker container
    private s3ForPresign

    /**
     * @constructor
     * @param {IConfig['s3']} s3Config - S3 configuration (region, endpoint, credentials)
     */

    private bucketName = 'rest-images-test-uat-bucket-temp-1'
    private s3Config
    
    constructor(s3Config: IConfig['s3']) {
        this.s3Config = s3Config;

        this.s3 = new S3Client(this.s3Config)

        this.s3ForPresign = new S3Client({
            ...this.s3Config,
            endpoint: this.s3Config.endpoint.replace('rustfs_dev', 'localhost')
        })
    }

    /**
     * @method init
     * @description Ensures the bucket exists and sets up CORS policy
     * @returns {Promise<void>}
     */
    public async init() {
        await this.ensureBucketExists()

        // Update cors policy for the bucket
        const command = new PutBucketCorsCommand({
            Bucket: this.bucketName,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedOrigins: ['*'],
                        AllowedMethods: ['GET', 'PUT', 'POST', 'HEAD'],
                        AllowedHeaders: ['*'],
                        ExposeHeaders: ['ETag']
                    }
                ]
            }
        })

        await this.s3.send(command)
    }

    /**
     * @method ensureBucketExists
     * @description Checks if the bucket exists, creates it if not
     * @private
     * @returns {Promise<void>}
     */
    private async ensureBucketExists() {
        try {
            await this.s3.send(new HeadBucketCommand({ Bucket: this.bucketName }))
        } catch {
            await this.s3.send(new CreateBucketCommand({ Bucket: this.bucketName }))
        }
    }

    /**
     * @method getUploadUrl
     * @description Generates a presigned URL for uploading a file and a public URL for accessing it
     *
     * @param {string} filename - Original file name
     * @param {string} contentType - MIME type of the file
     *
     * @returns {Promise<{
     *   uploadUrl: string,
     *   key: string,
     *   publicUrl: string
     * }>}
     */
    public async getUploadUrl(filename: string, contentType: string) {
        const key = `restaurants/${randomUUID()}-${filename}`

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType
        })

        const uploadUrl = await getSignedUrl(this.s3ForPresign, command)

        // Generate presigned GET URL for frontend
        const publicUrl = await this.getPublicUrl(key)

        return {
            uploadUrl,
            key,
            publicUrl  // frontend can use this to display the image
        }
    }

    /**
     * @method getPublicUrl
     * @description Builds a public URL for accessing an uploaded object
     *
     * @param {string} key - S3 object key
     * @returns {Promise<string>}
     */
    public async getPublicUrl(key: string) {
        return `${this.s3Config.endpoint.replace('rustfs_dev', 'localhost')}/${this.bucketName}/${key}`
    }

    /**
     * @method uploadFile
     * @description Uploads a file from local filesystem to S3
     *
     * @param {string} filePath - Path to the file on disk
     * @param {'banner' | 'menu'} keyPrefix - Folder prefix for organizing files
     *
     * @returns {Promise<string>} Public URL of uploaded file
     */
    public async uploadFile(filePath: string, keyPrefix: 'banner' | 'menu') {
        const fs = await import('fs')
        const path = await import('path')

        const fileBuffer = fs.readFileSync(filePath)
        const filename = path.basename(filePath)

        const key = `${keyPrefix}/${randomUUID()}-${filename}`

        await this.s3.send(new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: fileBuffer,
            ContentType: this.getContentType(filename)
        }))

        return this.getPublicUrl(key)
    }

    /**
     * @method getContentType
     * @description Determines MIME type based on file extension
     * @private
     *
     * @param {string} filename - File name
     * @returns {string} MIME type
     */

    private getContentType(filename: string) {
        if (filename.endsWith('.png')) {
            return 'image/png'
        }
        if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
            return 'image/jpeg'
        }
        return 'application/octet-stream'
    }
}

const s3Config = config.get<IConfig['s3']>('s3')
const s3Service = new AwsS3(s3Config)

s3Service.init()
    .then(() =>  logger.info('S3 bucket was initialized'))
    .catch((err) => logger.error('S3 bucket initialization failed: ', err))

export default s3Service