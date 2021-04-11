const { ipcRenderer } = require('electron');
const file = document.querySelector('#file');
const menuItem = document.querySelectorAll('.dropdown');
const navbarOpen = document.querySelector('.navbar-open');
const navbarHistogram = document.querySelector('.navbar-histogram');
const navbarPlotProfile = document.querySelector('.navbar-plot-profile');
const navbarAuthor = document.querySelector('.navbar-author');

menuItem.forEach(item => {
  item.addEventListener('mouseenter', toggleSub, false);
  item.addEventListener('mouseleave', toggleSub, false);
});

function toggleSub() {
  if(this.children.length > 1) {
    this.children[1].classList.toggle('show');
  } else {
    return false;
  }
}

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

navbarHistogram.addEventListener('click', () => ipcRenderer.send('add-histogram-window', ''));
navbarPlotProfile.addEventListener('click', () => ipcRenderer.send('add-plot-profile-window', ''));


  // function saveHistogram(histogramstring, filename)
  // {
  //   fs.writeFile(path.join(path.join(global.__dirname, '..', __dirname), filename), histogramstring, function (err)
  //   {
  //     if (err)
  //     {
  //       console.error(err);
  //     }
  //     else
  //     {
  //       console.log(filename + ' saved');
  //       histogram.src = path.join(path.join(global.__dirname, '..', __dirname), filename)
  //     }
  //   });
  // }


file.addEventListener('change', () => {
  const {name, path, type, size} = file.files[0];
  ipcRenderer.send('add-image-window', {name, path, type, size});
  file.value = '';
});