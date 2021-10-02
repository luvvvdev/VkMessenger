const path = require('path')
const fs = require('fs')

const rnScriptDir = path.resolve(__dirname, '../node_modules/react-native/scripts');
const scriptPath = rnScriptDir + '/find-node.sh';

let scriptData = '';

fs.readFile(scriptPath, {}, (err, data) => {
  if (err) throw err
  scriptData = data.toString()
  scriptData = scriptData.replace('set -e', 'set +e')

  fs.writeFile(scriptPath, scriptData, (err) => {
    if (err) return console.log('Patching error', err)
    console.log('react-native successful patched')
  })
})

