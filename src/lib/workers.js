/**
 * Worker-related tasks
 *
 */

// import fs from 'fs';
import url from 'url';
// import path from 'path';
import http from 'http';
import https from 'https';
import helpers from './helpers';
import _data from './data';
import _logs from './logs';

// Init the workers
const workers = {
	// Lookup all checks, get their data, send to a validator
	gatherAllChecks: () => {
		// Get all the checks
		_data.list('checks', (err, checks) => {
			if (!err && checks && checks.length > 0) {
				checks.forEach(curCheck => {
					// Read in the check data
					_data.read('checks', curCheck, (_err, originalCheckData) => {
						if (!_err && originalCheckData) {
							// Pass it to the check validator, and let that function continue or
							workers.validateCheckData(originalCheckData);
						} else {
							global.console.log(`Error reading one of the check's data`);
						}
					});
				});
			} else {
				global.console.log('Error: Could not find any checks or processes');
			}
		});
	},

	// Sanity check the check-data
	validateCheckData: originalCheckData => {
		const curOriginalCheckData =
			typeof originalCheckData === 'object' && originalCheckData !== null ? originalCheckData : {};
		curOriginalCheckData.id =
			typeof originalCheckData.id === 'string' && originalCheckData.id.trim().length === 20
				? originalCheckData.id
				: false;
		curOriginalCheckData.userPhone =
			typeof originalCheckData.userPhone === 'string' && originalCheckData.userPhone.trim().length === 10
				? originalCheckData.userPhone
				: false;
		curOriginalCheckData.protocol =
			typeof originalCheckData.protocol === 'string' && ['http', 'https'].indexOf(originalCheckData.protocol) > -1
				? originalCheckData.protocol
				: false;
		curOriginalCheckData.url =
			typeof originalCheckData.url === 'string' && originalCheckData.url.trim().length > 0
				? originalCheckData.url
				: false;
		curOriginalCheckData.method =
			typeof originalCheckData.method === 'string' &&
			['post', 'get', 'put', 'delete'].indexOf(originalCheckData.method) > -1
				? originalCheckData.method
				: false;
		curOriginalCheckData.successCodes =
			typeof originalCheckData.successCodes === 'object' &&
			originalCheckData.successCodes instanceof Array &&
			originalCheckData.successCodes.length > 0
				? originalCheckData.successCodes
				: false;
		curOriginalCheckData.timeoutSeconds =
			typeof originalCheckData.timeoutSeconds === 'number' &&
			originalCheckData.timeoutSeconds % 1 === 0 &&
			originalCheckData.timeoutSeconds >= 1 &&
			originalCheckData.timeoutSeconds <= 5
				? originalCheckData.timeoutSeconds
				: false;

		// Set the keys that may not be set (if the workers have never seen this check before)
		curOriginalCheckData.state =
			typeof originalCheckData.state === 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1
				? originalCheckData.state
				: 'down';
		curOriginalCheckData.lastChecked =
			typeof originalCheckData.lastChecked === 'number' && originalCheckData.lastChecked > 0
				? originalCheckData.lastChecked
				: false;
		// If all the checks pass, pass the data along to the next step in the process
		if (
			curOriginalCheckData.id &&
			curOriginalCheckData.userPhone &&
			curOriginalCheckData.protocol &&
			curOriginalCheckData.url &&
			curOriginalCheckData.method &&
			curOriginalCheckData.successCodes &&
			curOriginalCheckData.timeoutSeconds
		) {
			workers.performCheck(curOriginalCheckData);
		} else {
			global.console.log('Error: One of the checks is not properly formatted. Skipping it');
		}
	},
	// Preform the check, set the originalCheckData and the outcome of the check process, to the next step in the process
	performCheck: originalCheckData => {
		// Prepear the initial check outcome
		const curCheckOutcome = {
			error: false,
			responseCode: false,
		};

		// Mark that the outcome has not been sent yet
		let curOutcomeSent = false;

		// Parse the hostname and the path out of the original check data
		const curParsedUrl = url.parse(`${originalCheckData.protocol}://${originalCheckData.url}`, true);

		const curHostName = curParsedUrl.hostname;

		const curPath = curParsedUrl.path;

		const curRequestDetails = {
			protocol: `${originalCheckData.protocol}:`,
			hostname: curHostName,
			method: originalCheckData.method.toUpperCase(),
			path: curPath,
			timeout: originalCheckData.timeoutSeconds * 1000,
		};

		// Instanciate the request object (using either the http or https module)

		const curModuleToUse = originalCheckData.protocol === 'http' ? http : https;

		const curRequest = curModuleToUse.request(curRequestDetails, res => {
			// Grab the status of the sent request

			const curStatus = res.statusCode;

			curCheckOutcome.responseCode = curStatus;
			if (!curOutcomeSent) {
				workers.processCheckOutcome(originalCheckData, curCheckOutcome);
				curOutcomeSent = true;
			}
		});

		// Bind to the error event so it doesnt's get thrown
		curRequest.on('error', err => {
			// Update the check outcome and pass the data along
			curCheckOutcome.error = {
				error: true,
				value: err,
			};
			if (!curOutcomeSent) {
				workers.processCheckOutcome(originalCheckData, curCheckOutcome);
				curOutcomeSent = true;
			}
		});

		// Bind to the timeout event
		curRequest.on('timeout', () => {
			// Update the check outcome and pass the data along
			curCheckOutcome.error = {
				error: true,
				value: 'timeout',
			};
			if (!curOutcomeSent) {
				workers.processCheckOutcome(originalCheckData, curCheckOutcome);
				curOutcomeSent = true;
			}
		});

		// End the request
		curRequest.end();
	},

	// Process the check outcome, update the check data as needed, trigger an alert if needed
	// Special logic for accommodating a check that has never been tested before (don't alert on that one)
	processCheckOutcome: (originalCheckData, checkOutcome) => {
		// Decide if the check is considered up or down
		const curState =
			!checkOutcome.error &&
			checkOutcome.responseCode &&
			originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1
				? 'up'
				: 'down';

		// Decide if an allert is warranted
		const curAlertWarranted = originalCheckData.lastChecked && originalCheckData.state !== curState;

		// Log the outcome
		const curTimeOfCheck = Date.now();
		workers.log(originalCheckData, checkOutcome, curState, curAlertWarranted, curTimeOfCheck);

		// Update the check data
		const newCheckData = originalCheckData;
		newCheckData.state = curState;
		newCheckData.lastChecked = Date.now();

		// Save the updates
		_data.update('checks', newCheckData.id, newCheckData, err => {
			if (!err) {
				// Send the new check data to the next phase in the process if needed
				if (curAlertWarranted) {
					workers.alertUserToStatusChanged(newCheckData);
				} else {
					global.console.log('Check outcome has not changed, no alert needed');
				}
			} else {
				global.console.log('Error trying to save updates to one of the checks');
			}
		});
	},

	// Alert the user as to a change in there check status
	alertUserToStatusChanged: newCheckData => {
		const curMessage = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${
			newCheckData.url
		} is currently ${newCheckData.state}`;
		helpers.sendTwilioSms(newCheckData.userPhone, curMessage, err => {
			if (!err) {
				global.console.log(
					`Success: User was alerted to a status change in there check, via sms : ${curMessage}`
				);
			} else {
				global.console.log('Error: Could not send sms alert to user who had a state change in there check');
			}
		});
	},

	log: (originalCheckData, checkOutcome, curState, curAlertWarranted, curTimeOfCheck) => {
		// Form the log data
		const logData = {
			check: originalCheckData,
			outcome: checkOutcome,
			state: curState,
			alert: curAlertWarranted,
			time: curTimeOfCheck,
		};
		const logString = JSON.stringify(logData);

		// Determine the name of the log file
		const logFileName = originalCheckData.id;

		// Append the log file string to the file
		_logs.append(logFileName, logString, err => {
			if (!err) {
				global.console.log('Logging to file secceeded');
			} else {
				global.console.log('Logging to file failed');
			}
		});
	},

	// Timer to execute the the worker-process once per minute
	loop: () => {
		setInterval(() => {
			workers.gatherAllChecks();
		}, 1000 * 60);
	},

	// Init script
	initWorkers: () => {
		// Execute all the checks immediately
		workers.gatherAllChecks();

		// Call the loop so the checks will execute later on
		workers.loop();
	},
};

export default workers;
