// watch-fixtures.ts
import { watch } from 'chokidar';
import { spawn } from 'child_process';

const watcher = watch(['src/**/*.{ts,tsx}', 'test/**/*.{ts,json}'], {
  ignored: /node_modules/,
  ignoreInitial: true,
});

const runTests = () => {
  console.clear();
  console.log('🔁 Detected change, running fixture tests...\n');

  const proc = spawn('npx', ['ts-node', 'test/run-fixture-tests.ts'], { stdio: 'inherit' });

  proc.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ All tests passed!');
    } else {
      console.log('\n❌ Some tests failed. Fix and save to rerun.');
    }
  });
};

watcher.on('all', (event, path) => {
  runTests();
});
