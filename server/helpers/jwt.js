const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require("path");

// PRIVATE and PUBLIC key
var privateKEY = fs.readFileSync(path.resolve(__dirname, '../private/private.key'), 'utf8');
var publicKEY = fs.readFileSync(path.resolve(__dirname, '../private/public.key'), 'utf8');

var i = 'Web2019';          // Issuer 
var s = 'dummy@dummy.com';        // Subject 
var a = 'web2019'; // Audience

var signOptions = {
   issuer: i,
   subject: s,
   audience: a,
   expiresIn: "12h",
   algorithm: "RS256"
};
module.exports = {
   /*
     sOptions = {
      issuer: "Authorizaxtion/Resource/This server",
      subject: "iam@user.me",
      audience: "Client_Identity" // this should be provided by client
     }
    */
   sign: (payload, $Options, time) => {

      // Token signing options
      var signOptions = {
         issuer: $Options.issuer,
         subject: $Options.subject,
         audience: $Options.audience,
         expiresIn: time?time:"12h",    // 30 days validity
         algorithm: "RS256"
      };
      return jwt.sign(payload, privateKEY, signOptions);
   },
   verify: (token, $Option) => {
      /*
       vOption = {
        issuer: "Authorization/Resource/This server",
        subject: "iam@user.me", 
        audience: "Client_Identity" // this should be provided by client
       }  
      */
      var verifyOptions = {
         issuer: $Option.issuer,
         subject: $Option.subject,
         audience: $Option.audience,
         expiresIn: "12h",
         algorithm: ["RS256"]
      };
      try {
         return jwt.verify(token, publicKEY, verifyOptions);
      } catch (err) {
         // console.log(err);
         if(err.name == 'TokenExpiredError') return 'TokenExpiredError';
         return false;
      }
   },
   decode: (token) => {
      return jwt.decode(token, { complete: true });
      //returns null if token is invalid
   }
}