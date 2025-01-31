export enum PassportStrategy {
    google = 'google',
    jwtB2c = 'jwt-b2c',
    jwtB2cForgotPassword = 'jwt-b2c-forgot_password',
    jwtB2b = 'jwt-b2b'
}

export enum EmailType {
    forgotPassword = 'forgotPassword',
    registered = 'registered'
}

export enum JwtAudience {
    b2c ='b2c',
    b2b = 'b2b',
    forgotPassword = 'fps'
}

export enum NodeEnv {
    Dev = 'dev',
    Prod = 'prod',
    Test = 'test',
}