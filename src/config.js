const envs = {
	dev: {
		port: 3000,
		env: 'dev',
	},
	prod: {
		port: 5000,
		env: 'prod',
	},
};

const curEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : '';
const expEnv = typeof envs[curEnv] === 'object' ? envs[curEnv] : envs.dev;

export default expEnv;
