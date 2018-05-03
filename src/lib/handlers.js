const handlers = {
	/**
	 * Handlers
	 *
	 */
	users: (data, callback) => {
		const acceptableMethods = ['post', 'get', 'put', 'delete'];
		if (acceptableMethods.indexOf(data.method) > -1) {
			handlers.sub_users[data.method](data, callback);
		} else {
			callback(405);
		}
	},
	ping: (data, callback) => callback(200, { res: 'server is working' }),
	notFound: (data, callback) => callback(404),

	/**
	 * Subhandlers
	 * There is NO underscore good practice on airbnb eslint rules, so use sub_*
	 *
	 */
	sub_users: {
		post: (data, callback) => {
			callback();
		},
		get: (data, callback) => {
			callback();
		},
		put: (data, callback) => {
			callback();
		},
		delete: (data, callback) => {
			callback();
		},
	},
};

export default handlers;
