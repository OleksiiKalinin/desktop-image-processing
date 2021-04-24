const { ipcRenderer } = require('electron');
const myKernelInputs = document.querySelectorAll('.myKernel');
const allRadio = document.querySelectorAll('input[type="radio"]');
const submit = document.querySelector('.submit');
const allKernels = [
    [[0,-1,0],[-1,5,-1],[0,-1,0]],
    [[-1,-1,-1],[-1,9,-1],[-1,-1,-1]],
    [[1,-2,1],[-2,5,-2],[1,-2,1]],
    [[1,1,1],[0,0,0],[-1,-1,-1]],
    [[-1,-1,-1],[0,0,0],[1,1,1]],
    [[-1,0,1],[-1,0,1],[-1,0,1]],
    [[1,0,-1],[1,0,-1],[1,0,-1]],
    [[0,1,1],[-1,0,1],[-1,-1,0]],
    [[-1,-1,0],[-1,0,1],[0,1,1]],
    [[0,-1,-1],[1,0,-1],[1,1,0]],
    [[1,1,0],[1,0,-1],[0,-1,-1]]
]

submit.addEventListener('click', () => {
    let indexOfKernel = null, totalKernel;

    allRadio.forEach(radio => {
        if (radio.checked) indexOfKernel = +radio.value;
    }); 
    
    if (indexOfKernel !== null) {
        if (indexOfKernel !== 11) {
            totalKernel = allKernels[indexOfKernel];
        } else {
            let temp = [[],[],[]], j = -1;
            myKernelInputs.forEach((input, i) => {
                if (i % 3 === 0) j++;
                temp[j].push(+input.value);
            })
            totalKernel = temp;
        }
        ipcRenderer.send('navbar-opencv-methods', 'filter2d', {totalKernel});
    }
});