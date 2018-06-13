/**
 * Primary file for the API
 *
 */
import server from './lib/server';
import workers from './lib/workers';

// Declare the app and init function
const app = {
	init: () => {
		// Start the server
		server.initServer();
		// Start the workers
		workers.init();
	},
};

// Execute
app.init();

export default app;
