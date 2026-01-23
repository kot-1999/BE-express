export enum PassportStrategy {
    google = 'google',
    jwtB2c = 'jwt-b2c',
    jwtB2cForgotPassword = 'jwt-b2c-forgot_password',
    jwtB2b = 'jwt-b2b',
    jwtB2bForgotPassword = 'jwt-b2b-forgot_password',
}

export enum EmailType {
    forgotPassword = 'forgotPassword',
    registered = 'registered'
}

export enum JwtAudience {
    b2c ='b2c',
    b2b = 'b2b',
    b2cForgotPassword = 'b2cfps',
    b2bForgotPassword = 'b2bfps'
}

export enum NodeEnv {
    Dev = 'dev',
    Prod = 'prod',
    Test = 'test',
}