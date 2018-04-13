const envs = {
	dev: {
		httpPort: 3000,
		httpsPort: 3001,
		env: 'dev',
	},
	prod: {
		httpPort: 5000,
		httpsPort: 5001,
		env: 'prod',
	},
};

const curEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : '';
const expEnv = typeof envs[curEnv] === 'object' ? envs[curEnv] : envs.dev;

export default expEnv;
