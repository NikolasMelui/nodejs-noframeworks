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
					_data.read('checks', curCheck, (_err, originalCheckData) => {
						if (!_err && originalCheckData) {
							workers.validateCheckData(originalCheckData);
						} else {
							global.console.log(`Error reading one of the check's data`);
						}
					});
				});
			}
		});
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
