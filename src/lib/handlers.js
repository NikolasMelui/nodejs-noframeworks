import _data from './data';
import helpers from './helpers';

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
			const curFirstName =
				typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0
					? data.payload.firstName.trim()
					: false;
			const curLastName =
				typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0
					? data.payload.lastName.trim()
					: false;
			const curPhone =
				typeof data.payload.phone === 'string' && data.payload.phone.trim().length === 10
					? data.payload.phone.trim()
					: false;
			const curPassword =
				typeof data.payload.password === 'string' && data.payload.password.trim().length > 0
					? data.payload.password.trim()
					: false;
			const curTosAgreement =
				typeof data.payload.tosAgreement === 'boolean' && data.payload.tosAgreement === true
					? data.payload.tosAgreement
					: false;
			if (curFirstName && curLastName && curPhone && curPassword && curTosAgreement) {
				_data.read('users', curPhone, (err, data) => {
					if (err) {
						const curHashPassword = helpers.hash(curPassword);
						// Create new user object
						const userObject = {
							firstName: curFirstName,
							lastName: curLastName,
							phone: curPhone,
							hashedPassword: curHashPassword,
							tosAgreement: true,
						};
						_data.create('users', curPhone, userObject, _err => {
							if (!_err) {
								callback(200);
							} else {
								global.console.log(_err);
								callback(500, { Error: 'Could not create the new user.' });
							}
						});
					} else {
						callback(400, { Error: 'The user with that phone number is already exist.' });
					}
				});
			} else {
				callback(400, { Error: 'Missing required fields.' });
			}
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
