const FileReader = require('filereader');


// helpers

const toNodeBuffer = arrayBuffer => {
  const buffer = Buffer.alloc(arrayBuffer.byteLength);
  const arrayBufferView = new Uint8Array(arrayBuffer);

  for (let i = 0; i < buffer.length; i++) {
      buffer[i] = arrayBufferView[i];
  }

  return buffer;
};


// exported utils

const readBufferFromFile = file => {
  const fileReader = new FileReader();

  return new Promise(resolve => {
    fileReader.on('load', event => {
      const arrayBuffer = event.target.result;
      resolve(toNodeBuffer(arrayBuffer));
    });
    fileReader.readAsArrayBuffer(file);
  });
};


module.exports = {
  readBufferFromFile
};
