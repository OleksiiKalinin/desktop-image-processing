const {ipcRenderer} = require('electron')
const remote = require('electron').remote
const Jimp = require("jimp");
const div = document.querySelector('div');
const getCurrentWindow = remote.getCurrentWindow;
const dirname = remote.getGlobal('appPath');

ipcRenderer.send('image_window_loaded', '');

getCurrentWindow().on('focus', () => ipcRenderer.send('last_focused', getCurrentWindow().id));

let x1, x2, y1, y2, totalPoints = null, profileData = [];

function line(x1, x2, y1, y2) {
  let deltaX = Math.abs(x2 - x1);
  let deltaY = Math.abs(y2 - y1);
  let signX = x1 < x2 ? 1 : -1;
  let signY = y1 < y2 ? 1 : -1;
  let error = deltaX - deltaY;
  let res = [];

  while (x1 != x2 || y1 != y2) {
    res.push({
      x: x1,
      y: y1
    });

    let error2 = error * 2;

    if (error2 > -deltaY) {
      error -= deltaY;
      x1 += signX;
    }

    if (error2 < deltaX) {
      error += deltaX;
      y1 += signY;
    }
  }
  res.push({
    x: x2,
    y: y2
  });
  return res;
}

ipcRenderer.on('url', (_, {imgUrl, imgHeight, imgWidth}) => {
  div.style.width = imgWidth + 'px';
  div.style.height = imgHeight + 'px';

  const newUrl = imgUrl.split('\\');
  const name = newUrl[newUrl.length - 1];

  const lastDotId = name.split('').lastIndexOf('.');
  const preDotName = name.slice(0, lastDotId);
  const postDotName = name.slice(lastDotId+1);
  const newPath = dirname + '\\' + preDotName + '.bmp';
  const newTiffPath = newPath.split('\\');

  Jimp.read(imgUrl, async (err, img) => {
    if (err) {
      console.log(err);
    } else {
      if (postDotName === 'tif' || postDotName === 'tiff') {
        await img.writeAsync(newPath);
        div.style.background = 'url(' + newTiffPath.join('/') + ') no-repeat center';
      } else {
        div.style.background = 'url(' + newUrl.join('/') + ') no-repeat center';
      }
      div.onmousedown = (event) => {
        profileData = [];
        x1 = event.clientX;
        y1 = event.clientY;

        div.children[0].innerHTML = `<line x1="${x1}" y1="${y1}" x2="${x1}" y2="${y1}" stroke="yellow" />`;

        div.onmousemove = (e) => {
          profileData = [];
          x2 = e.clientX;
          y2 = e.clientY;

          div.children[0].innerHTML = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="yellow" />`;

          totalPoints = line(x1, x2, y1, y2);
          for (let coor of totalPoints) {
            const {r, g, b} = Jimp.intToRGBA(img.getPixelColor(coor.x, coor.y));
            profileData.push(Math.round(0.24 * r + 0.69 * g + 0.07 * b));
          }
          ipcRenderer.send('new_plot_data', profileData, getCurrentWindow().id);
        }

        div.onmouseup = (e) => {
          div.onmousemove = null;
          profileData = [];

          x2 = e.clientX;
          y2 = e.clientY;

          div.children[0].innerHTML = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="yellow" />`;

          totalPoints = line(x1, x2, y1, y2);

          for (let coor of totalPoints) {
            const {r, g, b} = Jimp.intToRGBA(img.getPixelColor(coor.x, coor.y));
            profileData.push(Math.round(0.24 * r + 0.69 * g + 0.07 * b));
          }
          ipcRenderer.send('new_plot_data', profileData, getCurrentWindow().id);
        };
      };
    }
  });
});