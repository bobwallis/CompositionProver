const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, 'gsiril.worker.js'), 'utf8');

function loadWorker(factory) {
    const messages = [];
    const imports = [];
    const context = vm.createContext({
        URL,
        self: { location: { href: 'https://example.com/prover/gsiril.worker.js' } },
        postMessage: message => messages.push(structuredClone(message)),
        importScripts: filename => {
            imports.push(filename);
            context.createGsiril = factory;
        }
    });
    vm.runInContext(source, context);
    return {
        messages,
        imports,
        send(request) {
            context.self.onmessage({ data: request });
            return context.runQueue;
        }
    };
}

test('loads the runtime and preserves the proof message protocol', async () => {
    const writes = [];
    const calls = [];
    const worker = loadWorker(async options => {
        assert.equal(options.locateFile('gsiril.wasm'), 'https://example.com/prover/gsiril.wasm');
        return {
            FS: { writeFile: (...args) => writes.push(args) },
            callMain: args => {
                calls.push(Array.from(args));
                options.print('Touch is true');
                options.printErr('diagnostic');
            }
        };
    });
    const args = ['--msiril'];
    await worker.send({ input: '4 bells\n', args });
    assert.deepEqual(worker.imports, ['gsiril.js']);
    assert.deepEqual(writes, [['gsiril.input', '4 bells\n']]);
    assert.deepEqual(calls, [['--msiril', '-f', 'gsiril.input']]);
    assert.deepEqual(args, ['--msiril']);
    assert.deepEqual(worker.messages, [{ output: 'Touch is true' }, { error: 'diagnostic' }]);
});

test('queues proofs with a fresh runtime for each request', async () => {
    let active = 0;
    let created = 0;
    const worker = loadWorker(async () => {
        assert.equal(active++, 0);
        created++;
        await new Promise(resolve => setImmediate(resolve));
        return {
            FS: { writeFile() {} },
            callMain: args => {
                assert.deepEqual(Array.from(args), ['-f', 'gsiril.input']);
                active--;
            }
        };
    });
    const first = worker.send({ input: 'first' });
    const second = worker.send({ input: 'second' });
    await Promise.all([first, second]);
    assert.equal(created, 2);
    assert.equal(active, 0);
    assert.deepEqual(worker.messages, []);
});

test('reports invalid input and can run the next request', async () => {
    let created = 0;
    const worker = loadWorker(async () => {
        created++;
        return { FS: { writeFile() {} }, callMain() {} };
    });
    await worker.send(null);
    await worker.send({ input: 'valid' });
    assert.equal(created, 1);
    assert.deepEqual(worker.messages, [{ error: 'GSiril input must be a string' }]);
});

test('reports initialization failures and retries on the next request', async () => {
    let created = 0;
    const worker = loadWorker(async () => {
        if (++created === 1) throw new Error('Unable to load gsiril.wasm');
        return { FS: { writeFile() {} }, callMain() {} };
    });
    await worker.send({ input: 'first' });
    await worker.send({ input: 'second' });
    assert.equal(created, 2);
    assert.deepEqual(worker.messages, [{ error: 'Unable to load gsiril.wasm' }]);
});

test('accepts completed proof exits and reports unexpected exits', async () => {
    let status = 0;
    const worker = loadWorker(async () => ({
        FS: { writeFile() {} },
        callMain() {
            const error = new Error('exit ' + status);
            error.name = 'ExitStatus';
            error.status = status;
            throw error;
        }
    }));
    for (status of [0, 1, 2]) {
        await worker.send({ input: 'proof' });
    }
    assert.deepEqual(worker.messages, [{ error: 'exit 2' }]);
});
