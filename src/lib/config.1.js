const envs = {
  dev: {
    httpPort: 3000,
    httpsPort: 3001,
    env: 'dev',
    hashingSecret: 'secretKey',
    maxChecks: 5,
    twilio: {
      accountSid: '',
      authToken: '',
      fromPhone: ''
    },
    templateGlobals: {
      appName: '',
      companyName: '',
      yearCreated: '',
      baseUrl: ''
    }
  },
  prod: {
    httpPort: 5000,
    httpsPort: 5001,
    env: 'prod',
    hashingSecret: 'secretKey',
    maxChecks: 5,
    twilio: {
      accountSid: '',
      authToken: '',
      fromPhone: ''
    },
    templateGlobals: {
      appName: '',
      companyName: '',
      yearCreated: '',
      baseUrl: ''
    }
  }
};

const curEnv =
  typeof process.env.NODE_ENV === 'string'
    ? process.env.NODE_ENV.toLowerCase()
    : '';
const expEnv = typeof envs[curEnv] === 'object' ? envs[curEnv] : envs.dev;

export default expEnv;
