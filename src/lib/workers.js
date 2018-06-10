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
	gatherAllChecks: () => {},

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
