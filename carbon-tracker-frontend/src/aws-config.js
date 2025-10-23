export const awsConfig = {
    Auth: {
      Cognito: {
        userPoolId: "eu-north-1_KLfnWUPYQ",
        userPoolClientId: "3nl5920uu701rgef6drqu4qoa0",
        loginWith: {
          oauth: {
            domain: "eu-north-1klfnwupyq.auth.eu-north-1.amazoncognito.com",
            scopes: ["openid", "email", "profile"],
            redirectSignIn: ["http://localhost:5173/"],
            redirectSignOut: ["http://localhost:5173/"],
            responseType: "code"
          }
        }
      }
    }
  }
  