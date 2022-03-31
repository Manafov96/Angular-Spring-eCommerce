export default {
    oidc: {
        clientId: '<enter your client id>',
        issuer: 'https://<issuer>/oauth2/default',
        redirectUri: 'http://localhost:4200/login/callback',
        scopes: ['openid', 'profile', 'email']
    }
}