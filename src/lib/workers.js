/**
 * Worker-related tasks
 *
 */

// Deps
import fs from 'fs';
import url from 'url';
import path from 'path';
import http from 'http';
import https from 'https';
import helpers from './helpers';
import _data from './data';

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
			originalCheckData.timeoutSeconds <= 5 &&
			originalCheckData.timeoutSeconds.length > 0
				? originalCheckData.timeoutSeconds
				: false;

		// Set the keys that may not be set (if the workers have never seen this check before)
		curOriginalCheckData.state =
			typeof originalCheckData.state === 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1
				? originalCheckData.state
				: 'down';
		curOriginalCheckData.lastChecked =
			typeof originalCheckData.lastChecked === 'number' &&
			originalCheckData.lastChecked > 0 &&
			originalCheckData.lastChecked.length > 0
				? originalCheckData.lastChecked
				: false;
		// If all the checks pass, pass the data along to the next step in the process
		if (
			curOriginalCheckData.id &&
			curOriginalCheckData.userPhone &&
			curOriginalCheckData.protocol &&
			curOriginalCheckData.url &&
			curOriginalCheckData.nethod &&
			curOriginalCheckData.successCodes &&
			curOriginalCheckData.timeoutSeconds
		) {
			workers.preformCheck(curOriginalCheckData);
		} else {
			global.console.log('Error: One of the checks is not properly formatted. Scipping it');
		}
	},
	// Timer to execute the the worker-process once per minute
	loop: () => {
		setInterval(workers.gatherAllChecks(), 1000 * 60);
	},

	// Init script
	init: () => {
		// Execute all the checks immediately
		workers.gatherAllChecks();

		// Call the loop so the checks will execute later on
		workers.loop();
	},
};

export default workers;
