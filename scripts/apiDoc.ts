import * as fs from 'node:fs';
import * as path from 'node:path';

import Joi from 'joi';
import j2s from 'joi-to-swagger'
import swaggerAutogen from 'swagger-autogen';

import { AdminController } from '../src/controllers/b2b/v1/admin/AdminController';
import {
    AuthorizationController as b2bAuthorizationController
} from '../src/controllers/b2b/v1/authorization/AuthorizationController';
import { AuthorizationController as UserAuthorizationController } from '../src/controllers/b2c/v1/authorization/AuthorizationController';
import { UsersController } from '../src/controllers/b2c/v1/user/UserController';

/**
 * Link all endpoints to their schemas
 * Requirements:
 *   - All schema names must be under the valid category: b2c.v1.getUser
 *   - Schema names and endpoint names must be the same getUser (endpoint Name) === getUser (Schema name)
 * All new endpoints must be listed here
 * */
const schemas: {[key: string]: {[key: string]: any}} = {
    b2c: {
        v1: {
            // Auth
            register: UserAuthorizationController.schemas,
            login: UserAuthorizationController.schemas,
            forgotPassword: UserAuthorizationController.schemas,
            logout: UserAuthorizationController.schemas,
            resetPassword: UserAuthorizationController.schemas,
            // Admin
            getUser: UsersController.schemas,
            deleteUser: UsersController.schemas
        }
    },
    b2b: {
        v1: {
            // Auth
            register: b2bAuthorizationController.schemas,
            login: b2bAuthorizationController.schemas,
            forgotPassword: b2bAuthorizationController.schemas,
            logout: b2bAuthorizationController.schemas,
            resetPassword: b2bAuthorizationController.schemas,
            // User
            getAdmin: AdminController.schemas,
            deleteAdmin: AdminController.schemas
        }
    }
}

/**
 * Converts Joi schema to a simplified custom schema format:
 * - Removes "additionalProperties"
 * - Removes "required" arrays
 * - Removes "type" fields unless structural (object/array)
 * - Works recursively for nested objects/arrays
 * - Formats leaf nodes as "type format required"
 */

function joiToCustomSwagger(node: any, key: string | null = null, parentRequired: string[] = []): any {
    if (!node || typeof node !== 'object') {
        return node
    }
    if ('additionalProperties' in node) {
        delete node.additionalProperties
    }

    // Handle arrays
    if (node.type === 'array') {
        const items = node.items ? joiToCustomSwagger(node.items, null, []) : {}
        const constraintParts: string[] = []

        if (node.minItems) {
            constraintParts.push(`minItems:${node.minItems}`)
        }
        if (node.maxItems) {
            constraintParts.push(`maxItems:${node.maxItems}`)
        }
        if (node.length) {
            constraintParts.push(`length:${node.length}`)
        }

        const base = Array.isArray(items) || typeof items === 'object' ? [items] : [String(items)]
        if (constraintParts.length > 0) {
            base.push(`(${constraintParts.join(' ')})`)
        }

        return base
    }

    // Handle objects and inline their properties
    if (node.properties && typeof node.properties === 'object') {
        const requiredKeys: string[] = Array.isArray(node.required) ? node.required : []
        const out: Record<string, any> = {}

        for (const [propName, propNode] of Object.entries(node.properties)) {
            const transformed = joiToCustomSwagger(propNode, propName, requiredKeys)

            if (typeof transformed === 'string') {
                out[propName] = requiredKeys.includes(propName) && !transformed.includes('required')
                    ? `${transformed} required`
                    : transformed
            } else {
                out[propName] = transformed
            }
        }

        return out
    }

    // Handle primitive leaf nodes (string, integer, boolean, etc.)
    if (node.type && node.type !== 'object' && node.type !== 'array') {
        const parts: string[] = []

        if (node.type) {
            parts.push(node.type)
        }
        if (node.format) {
            parts.push(node.format)
        }

        // Add min/max/length constraints depending on type
        if (node.type === 'string') {
            if (node.minLength) {
                parts.push(`min:${node.minLength}`)
            }
            if (node.maxLength) {
                parts.push(`max:${node.maxLength}`)
            }
            if (node.length) {
                parts.push(`length:${node.length}`)
            }
        }
        if (node.type === 'integer' || node.type === 'number') {
            if (node.minimum) {
                parts.push(`min:${node.minimum}`)
            }
            if (node.maximum) {
                parts.push(`max:${node.maximum}`)
            }
        }

        // Add 'required' if applicable
        const isRequired = key !== null && parentRequired.includes(key)
        if (isRequired) {
            parts.push('required')
        }

        return parts.join(' ')
    }

    // Fallback for unrecognized structures
    const result: any = Array.isArray(node) ? [] : {}
    for (const key of Object.keys(node)) {
        result[key] = joiToCustomSwagger(node[key], null, [])
    }
    return result
}

const definitions: any = {}

Object.keys(schemas).forEach((platform) => {
    Object.keys(schemas[platform]).forEach((version) => {
        Object.keys(schemas[platform][version]).forEach((endpoint) => {
            const reference = `${platform}${version.toUpperCase()}${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}`

            const controllerSchemas = schemas[platform][version][endpoint]
            const reqSchema = controllerSchemas.request[endpoint]
            const resSchema = controllerSchemas.response[endpoint]
            if (!Joi.isSchema(reqSchema)) {
                throw new Error('Is not a request schema: ' + platform + version +endpoint)
            }

            if (!Joi.isSchema(resSchema)) {
                throw new Error('Is not a response schema: ' + platform + version +endpoint)
            }

            definitions[`${reference}ReqBody`] = joiToCustomSwagger(j2s(reqSchema).swagger?.properties?.body)
            definitions[`${reference}Res`] = joiToCustomSwagger(j2s(resSchema).swagger?.properties)
        })
    })
})

const doc = {
    info: {
        title: 'My API',
        description: 'Description'
    },
    host: 'localhost:3000',
    definitions
}

const distDir = path.join(__dirname, '../dist')
const apiDocDir = path.join(__dirname, '../dist/apiDoc')

const outFile = 'swaggerApi.json'

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir)
}

if (!fs.existsSync(apiDocDir)) {
    fs.mkdirSync(apiDocDir)
}

swaggerAutogen()(path.join(apiDocDir, outFile), [path.join(__dirname, '../src/routes/*.ts')], doc);