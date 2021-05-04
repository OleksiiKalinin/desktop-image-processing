const { ipcRenderer } = require('electron');
const file = document.querySelector('#file');
const menuItem = document.querySelectorAll('.dropdown');
const nestedItems = document.querySelectorAll('.nested');
const navbarOpen = document.querySelector('.navbar-open');
const navbarHistogram = document.querySelector('.navbar-histogram');
const navbarHistogram2d = document.querySelector('.navbar-histogram2d');
const navbarPlotProfile = document.querySelector('.navbar-plot-profile');
const navbarAuthor = document.querySelector('.navbar-author');
const navbarNormalize = document.querySelector('.navbar-normalize');
const navbarEqualize = document.querySelector('.navbar-equalize');
const navbarNegacja = document.querySelector('.navbar-negacja');
const navbarProgowanie = document.querySelector('.navbar-progowanie');
const navbarProgowanieZps = document.querySelector('.navbar-progowanie-zps');
const navbarPosterize = document.querySelector('.navbar-posterize');
const navbarBlur = document.querySelector('.navbar-blur');
const navbarGaussianBlur = document.querySelector('.navbar-gaussianBlur');
const navbarSobel = document.querySelector('.navbar-sobel');
const navbarLaplasian = document.querySelector('.navbar-laplasian');
const navbarCanny = document.querySelector('.navbar-canny');
const navbarMoreFilters = document.querySelector('.navbar-more-filters');
const navbarMedian = document.querySelector('.navbar-median');

const navbarAdd = document.querySelector('.navbar-add');
const navbarSub = document.querySelector('.navbar-substract');
const navbarBlend = document.querySelector('.navbar-blend');
const navbarAND = document.querySelector('.navbar-AND');
const navbarOR = document.querySelector('.navbar-OR');
const navbarNOT = document.querySelector('.navbar-NOT');
const navbarXOR = document.querySelector('.navbar-XOR');

// const cv = require('opencv4nodejs')
// let temp = [-9]
// let matFromArray = Buffer.from(temp)
// let matFromArray = new cv.Mat(3, 3, cv.CV_8U, temp)
// console.log(matFromArray.getData())
// console.log(cv.Mat.eye(3, 3, cv.CV_8U).getData())
// cv.medianBlur
// console.log(matFromArray.getDataAsArray())

{
  let isTaskbar = false

  navbarOpen.addEventListener('click', () => {
    isTaskbar = true;
    file.click();
  }, false);

  file.addEventListener('click', (e) => {
    if (!isTaskbar) e.preventDefault();
    isTaskbar = false;
  });
}

menuItem.forEach(item => {
  item.addEventListener('mouseenter', toggleSub, false);
  item.addEventListener('mouseleave', toggleSub, false);
});

function toggleSub() {
  if(this.children.length > 1) {
    if (this.children[1].classList.value.includes('nested')){
      const {top, left, width} = this.getBoundingClientRect();
      this.children[1].style.top = top + 'px';
      this.children[1].style.left = left + width + 'px';
    }
    this.children[1].classList.toggle('show');
  } else {
    return false;
  }
}

nestedItems.forEach(item => {
  for(let i = 0; i < item.children.length; ++i) {
    if(item.children[i].children.length > 1) {
      for(let j = 0; j < item.children[i].children.length; ++j) {
        item.children[i].addEventListener('mouseenter', () => {
          item.children[i].children[j].classList.toggle('hide');
        });
        item.children[i].addEventListener('mouseleave', () => {
          item.children[i].children[j].classList.toggle('hide');
        });
      }
    }
  }
})

navbarHistogram.addEventListener('click', () => ipcRenderer.send('add-histogram-window', ''));
navbarBlur.addEventListener('click', () => ipcRenderer.send('navbar-opencv-methods', 'blur'));
navbarGaussianBlur.addEventListener('click', () => ipcRenderer.send('navbar-opencv-methods', 'gaussianBlur'));
navbarSobel.addEventListener('click', () => ipcRenderer.send('navbar-opencv-methods', 'sobel'));
navbarLaplasian.addEventListener('click', () => ipcRenderer.send('navbar-opencv-methods', 'laplacian'));
navbarCanny.addEventListener('click', () => ipcRenderer.send('navbar-opencv-methods', 'canny'));
navbarMoreFilters.addEventListener('click', () => ipcRenderer.send('add-more-filters-window', ''));
navbarMedian.addEventListener('click', () => ipcRenderer.send('add-median-window', ''));
navbarPlotProfile.addEventListener('click', () => ipcRenderer.send('add-plot-profile-window', ''));

navbarEqualize.addEventListener('click', () => ipcRenderer.send('navbar-own-methods', 'equalize'));
navbarNegacja.addEventListener('click', () => ipcRenderer.send('navbar-own-methods', 'negacja'));
navbarNormalize.addEventListener('click', () => {
  let Lmax = +(navbarNormalize.parentNode.firstChild.value);

  if (isNaN(Lmax)) return;
  if (Lmax <= 0 || Lmax > 255) Lmax = 255;
  
  ipcRenderer.send('navbar-own-methods', 'normalize', {Lmax});
});

navbarProgowanie.addEventListener('click', () => {
  let prog = +(navbarProgowanie.parentNode.firstChild.value);

  if (isNaN(prog)) return;
  if (prog < 0) prog = 0;
  if (prog > 255) prog = 255;
  
  ipcRenderer.send('navbar-own-methods', 'progowanie', {prog});
});

navbarPosterize.addEventListener('click', () => {
  let count = +(navbarPosterize.parentNode.firstChild.value);

  if (isNaN(count)) return;
  if (count < 0) count = 0;
  if (count > 255) count = 255;
  
  ipcRenderer.send('navbar-own-methods', 'posterize', {count});
});

navbarProgowanieZps.addEventListener('click', () => {
  let values = navbarProgowanieZps.parentNode.firstChild.value.replace(/\D+/g, ' ').trim().split(' ').slice(0, 2).map(a => +a).sort((a,b) => a - b);

  values.forEach(value => {
    if (value < 0) value = 0; 
    if (value > 255) value = 255;
  })
  
  if (values.length < 2) values.push(255);

  ipcRenderer.send('navbar-own-methods', 'progowanie-zps', {p1: values[0], p2: values[1]});
});

navbarAdd.addEventListener('click', () => ipcRenderer.send('add-twoimg-window', 'Add'));
navbarSub.addEventListener('click', () => ipcRenderer.send('add-twoimg-window', 'Substract'));
navbarBlend.addEventListener('click', () => ipcRenderer.send('add-twoimg-window', 'Blend'));
navbarAND.addEventListener('click', () => ipcRenderer.send('add-twoimg-window', 'AND'));
navbarOR.addEventListener('click', () => ipcRenderer.send('add-twoimg-window', 'OR'));
navbarNOT.addEventListener('click', () => ipcRenderer.send('add-twoimg-window', 'NOT'));
navbarXOR.addEventListener('click', () => ipcRenderer.send('add-twoimg-window', 'XOR'));
navbarHistogram2d.addEventListener('click', () => ipcRenderer.send('add-twoimg-window', 'Histogram 2D'));


file.addEventListener('change', () => {
  const {name, path, type, size} = file.files[0];
  
  ipcRenderer.send('add-image-window', {name, path, type, size});
  file.value = '';
});