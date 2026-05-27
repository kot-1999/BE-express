import { Response, NextFunction, AuthAdminRequest } from 'express'
import Joi from 'joi'

import s3Service from '../services/AwsS3'
import { AbstractController } from '../types/AbstractController'
import { JoiCommon } from '../types/JoiCommon'

export class FileUpload extends AbstractController {
    public static readonly schemas = {
        request: {
            putFile: JoiCommon.object.request.keys({
                body: Joi.object({
                    filename: Joi.string().required(),
                    contentType: Joi.string().valid('image/png', 'image/jpeg', 'image/webp')
                        .required()
                }).required()
            }).required()
        },
        response: {
            putFile: Joi.object({
                publicUrl: Joi.string().uri()
                    .required(),
                uploadUrl: Joi.string().uri()
                    .required(),
                key: Joi.string().required()
            }).required()

        }
    }

    constructor() {
        super()
    }

    private PutFileReqType: Joi.extractType<typeof FileUpload.schemas.request.putFile>
    private PutFileResType: Joi.extractType<typeof FileUpload.schemas.response.putFile>
    public async putFile(
        req: AuthAdminRequest & typeof this.PutFileReqType,
        res: Response<typeof this.PutFileResType>,
        next: NextFunction
    ) {
        try {
            const { filename, contentType } = req.body

            const result = await s3Service.getUploadUrl(
                filename,
                contentType
            )

            return res.status(200).json(result)
        } catch (err) {
            return next(err)
        }
    }

}