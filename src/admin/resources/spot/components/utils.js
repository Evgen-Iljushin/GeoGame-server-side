
export const readImageFromFile = file => {
  const reader = new FileReader();

  return new Promise(resolve => {
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
};


export const readBase64FromArrayBuffer = arrayBuffer => {
  const arrayBufferView = new Uint8Array(arrayBuffer);
  const arrayBufferLength = arrayBufferView.byteLength;
  let binaryString = '';

  for (let i = 0; i < arrayBufferLength; i++) {
      binaryString += String.fromCharCode(arrayBufferView[i]);
  }

  return window.btoa(binaryString);
};
