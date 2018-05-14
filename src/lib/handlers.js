import _data from './data';
import helpers from './helpers';

/* eslint no-param-reassign: ['error', { 'props': true, 'ignorePropertyModificationsFor': ['__data', 'userData', 'tokenData'] }] */

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
	tokens: (data, callback) => {
		const acceptableMethods = ['post', 'get', 'put', 'delete'];
		if (acceptableMethods.indexOf(data.method) > -1) {
			handlers.sub_tokens[data.method](data, callback);
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
				typeof data.payload.phone === 'string' && data.payload.phone.trim().length === 11
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
				_data.read('users', curPhone, err => {
					if (err) {
						const curHashedPassword = helpers.hash(curPassword);
						// Create new user object
						if (curHashedPassword) {
							const userObject = {
								firstName: curFirstName,
								lastName: curLastName,
								phone: curPhone,
								hashedPassword: curHashedPassword,
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
							callback(400, { Error: "Could not hash the user's password." });
						}
					} else {
						callback(500, { Error: 'The user with that phone number is already exist.' });
					}
				});
			} else {
				callback(400, { Error: 'Missing required fields.' });
			}
		},
		get: (data, callback) => {
			const curPhone =
				typeof data.queryStringObject.phone === 'string' && data.queryStringObject.phone.trim().length === 11
					? data.queryStringObject.phone.trim()
					: false;
			if (curPhone) {
				const curToken = typeof data.headers.token === 'string' ? data.headers.token : false;
				handlers.sub_tokens.verifyToken(curToken, curPhone, tokenIsValid => {
					if (tokenIsValid) {
						_data.read('users', curPhone, (err, __data) => {
							if (!err && __data) {
								delete __data.hashedPassword;
								callback(200, __data);
							} else {
								global.console.log(err);
								callback(404);
							}
						});
					} else {
						callback(405, { Error: 'Wrong header token.' });
					}
				});
			} else {
				callback(400, { Error: 'Missing required field.' });
			}
		},
		put: (data, callback) => {
			const curFirstName =
				typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0
					? data.payload.firstName.trim()
					: false;
			const curLastName =
				typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0
					? data.payload.lastName.trim()
					: false;
			const curPhone =
				typeof data.payload.phone === 'string' && data.payload.phone.trim().length === 11
					? data.payload.phone.trim()
					: false;
			const curPassword =
				typeof data.payload.password === 'string' && data.payload.password.trim().length > 0
					? data.payload.password.trim()
					: false;
			if (curPhone) {
				if (curFirstName || curLastName || curPassword) {
					const curToken = typeof data.headers.token === 'string' ? data.headers.token : false;
					handlers.sub_tokens.verifyToken(curToken, curPhone, tokenIsValid => {
						if (tokenIsValid) {
							_data.read('users', curPhone, (err, userData) => {
								if (!err && userData) {
									if (curFirstName) {
										userData.firstName = curFirstName;
									}
									if (curLastName) {
										userData.lastName = curLastName;
									}
									if (curPassword) {
										userData.hashedPassword = helpers.hash(curPassword);
									}
									_data.update('users', curPhone, userData, _err => {
										if (!_err) {
											callback(200);
										} else {
											global.console.log(_err);
											callback(400, { Error: 'Could not update the user.' });
										}
									});
								} else {
									callback(400, { Error: 'The specified user does not exist.' });
								}
							});
						} else {
							callback(405, { Error: 'Wrong header token.' });
						}
					});
				} else {
					callback(400, { Error: 'Missing fields to update.' });
				}
			} else {
				callback(400, { Error: 'The specified user does not exist.' });
			}
		},
		delete: (data, callback) => {
			const curPhone =
				typeof data.queryStringObject.phone === 'string' && data.queryStringObject.phone.trim().length === 11
					? data.queryStringObject.phone.trim()
					: false;
			if (curPhone) {
				const curToken = typeof data.headers.token === 'string' ? data.headers.token : false;
				handlers.sub_tokens.verifyToken(curToken, curPhone, tokenIsValid => {
					if (tokenIsValid) {
						_data.read('users', curPhone, (err, userData) => {
							if (!err && userData) {
								_data.delete('users', curPhone, _err => {
									if (!_err) {
										callback(200);
									} else {
										global.console.log(_err);
										callback(500, { Error: 'Could not delete the specified user.' });
									}
								});
							} else {
								callback(400, { Error: 'Could not find the specified user.' });
							}
						});
					} else {
						callback(405, { Error: 'Wrong header token.' });
					}
				});
			} else {
				callback(400, { Error: 'Missing required field.' });
			}
		},
	},
	sub_tokens: {
		post: (data, callback) => {
			const curPhone =
				typeof data.payload.phone === 'string' && data.payload.phone.trim().length === 11
					? data.payload.phone.trim()
					: false;
			const curPassword =
				typeof data.payload.password === 'string' && data.payload.password.trim().length > 0
					? data.payload.password.trim()
					: false;
			if (curPhone && curPassword) {
				_data.read('users', curPhone, (err, userData) => {
					if (!err && userData) {
						const curHashedPassword = helpers.hash(curPassword);
						if (userData.hashedPassword === curHashedPassword) {
							const curTokenId = helpers.createRandomString(20);
							const curExpires = Date.now() + 1000 * 60 * 60;
							const tokenObject = {
								phone: curPhone,
								id: curTokenId,
								expires: curExpires,
							};
							_data.create('tokens', curTokenId, tokenObject, _err => {
								if (!_err) {
									callback(200, tokenObject);
								} else {
									callback(500, { Error: 'Could not create the new token.' });
								}
							});
						} else {
							callback(400, { Error: 'Wrong password.' });
						}
					} else {
						callback(400, { Error: 'Could not find the specified user.' });
					}
				});
			} else {
				callback(400, { Error: 'Missing required fields.' });
			}
		},
		get: (data, callback) => {
			const curTokenId =
				typeof data.queryStringObject.id === 'string' && data.queryStringObject.id.trim().length === 20
					? data.queryStringObject.id.trim()
					: false;
			if (curTokenId) {
				_data.read('tokens', curTokenId, (err, tokenData) => {
					if (!err && tokenData) {
						callback(200, tokenData);
					} else {
						callback(400);
					}
				});
			} else {
				callback(400, { Error: 'Missing required field.' });
			}
		},
		put: (data, callback) => {
			const curTokenId =
				typeof data.payload.id === 'string' && data.payload.id.trim().length === 20
					? data.payload.id.trim()
					: false;
			const curTokenExtend =
				typeof data.payload.extend === 'boolean' && data.payload.extend ? data.payload.extend : false;
			if (curTokenExtend && curTokenId) {
				_data.read('tokens', curTokenId, (err, tokenData) => {
					if (!err && tokenData) {
						if (tokenData.expires > Date.now()) {
							tokenData.expires = Date.now() + 1000 * 60 * 60;
							_data.update('tokens', curTokenId, tokenData, _err => {
								if (!_err) {
									callback(200);
								} else {
									callback(500, { Error: 'Could not update the specified token.' });
								}
							});
						} else {
							callback(400, 'The specified token is already expired.');
						}
					} else {
						callback(400, { Error: 'Could not read the specified token.' });
					}
				});
			} else {
				callback(400, { Error: 'Missing required fields.' });
			}
		},
		delete: (data, callback) => {
			const curTokenId =
				typeof data.queryStringObject.id === 'string' && data.queryStringObject.id.trim().length === 20
					? data.queryStringObject.id.trim()
					: false;
			if (curTokenId) {
				_data.read('tokens', curTokenId, (err, tokenData) => {
					if (!err && tokenData) {
						_data.delete('tokens', curTokenId, _err => {
							if (!_err) {
								callback(200);
							} else {
								global.console.log(_err);
								callback(500, { Error: 'Could not delete the specified token.' });
							}
						});
					} else {
						callback(400, { Error: 'Could not find the specified token.' });
					}
				});
			} else {
				callback(400, { Error: 'Missing required field.' });
			}
		},
		verifyToken: (curTokenId, curPhone, callback) => {
			_data.read('tokens', curTokenId, (err, tokenData) => {
				if (!err && tokenData) {
					if (tokenData.phone === curPhone && tokenData.expires > Date.now()) {
						callback(true);
					} else {
						callback(false);
					}
				} else {
					callback(false);
				}
			});
		},
	},
	checks: (data, callback) => {
		const acceptableMethods = ['post', 'get', 'put', 'delete'];
		if (acceptableMethods.indexOf(data.method) > -1) {
			handlers.sub_checks[data.method](data, callback);
		} else {
			callback(405);
		}
	},
	sub_checks: {
		post: (data, callback) => {
			const curProtocol =
				typeof data.payload.protocol === 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1
					? data.payload.protocol
					: false;
			const curUrl =
				typeof data.payload.url === 'string' && data.payload.protocol.trim().length > 0
					? data.payload.protocol.trim()
					: false;
			const curMethod =
				typeof data.payload.method === 'string' &&
				['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1
					? data.payload.method
					: false;
			const curSuccessCodes =
				typeof data.payload.seccessCodes === 'object' &&
				data.payload.successCodes instanceof Array &&
				data.payload.successCodes.length > 0
					? data.payload.successCodes
					: false;
			const curTimeoutSeconds =
				typeof data.payload.timeoutSeconds === 'number' &&
				data.payload.timeoutSeconds % 1 === 0 &&
				data.payload.timeoutSeconds >= 1 &&
				data.payload.timeoutSeconds <= 5
					? data.payload.timeoutSeconds
					: false;
			callback(curProtocol, curUrl, curMethod, curSuccessCodes, curTimeoutSeconds);
		},
	},
};

export default handlers;
