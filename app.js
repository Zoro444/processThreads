import fs from "fs";
import child from "child_process";
import path from "path";

function createDir(filePath) {
  fs.stat(path.resolve(filePath), (err) => {
    if(err) {
      fs.mkdir(path.resolve(filePath), (err) => {
        if(err) {
          console.log(err);
        }
      });
    }
  });
}

function childProcess(command, args, timeOut = Infinity) {
  return new Promise((resolve, reject) => {
    
  let error = "";
  let success = true;
  let start = new Date();
  let duration = 0;
  let commandSuccess  = true;

  try {
    const childProcess = child.spawn(command, args);

    childProcess.on('error', (err) => {
      error = err.code;
      success = false;
      console.log('error',err.toString());
    });

    childProcess.stderr.on('data', (err) => {
      success = false;
      error = err.toString();
    })
    
    childProcess.on('close', (data) => {
      duration = new Date() - start;
      let params = {
        command,
        start,
        duration,
        success,
      }
    
      if (error) {
        params.error = error;
      }
    
      if (!success) {
        params.commandSuccess = false;
      }
      save(params);
      resolve();
    });

    createDir(path.resolve('logs'));
    
  } catch(err) {
      reject(err);
      console.log(err);
  }
 })
}

function save(params) {
  let timestamp = new Date().toISOString().replace(/:/g, '-');
  let filePath = `${timestamp}${params.command}.json`;
  console.log(filePath);
  fs.writeFile(path.join(path.resolve('logs'), filePath), JSON.stringify(params), (err) => {
    if (err) {
        console.log(err);
    }
  });
}
export default childProcess;
