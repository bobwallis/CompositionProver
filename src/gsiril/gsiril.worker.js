importScripts('gsiril.js');

var runQueue = Promise.resolve();

self.onmessage = function(event) {
	runQueue = runQueue
		.then(function() {
			return runGsiril(event.data);
		})
		.catch(function(error) {
			postMessage({ error: error.message || String(error) });
		});
};

async function runGsiril(request) {
	if (!request || typeof request.input !== 'string') {
		throw new TypeError('GSiril input must be a string');
	}

	var module = await createGsiril({
		print: function(text) {
			postMessage({ output: text });
		},
		printErr: function(text) {
			postMessage({ error: text });
		},
		locateFile: function(path) {
			return new URL(path, self.location.href).toString();
		}
	});

	module.FS.writeFile('gsiril.input', request.input);

	var args = Array.isArray(request.args) ? request.args.slice() : [];
	args.push('-f', 'gsiril.input');

	try {
		module.callMain(args);
	} catch (error) {
		// A false touch is a completed proof with exit status 1.
		if (error.name !== 'ExitStatus' || (error.status !== 0 && error.status !== 1)) {
			throw error;
		}
	}
}
