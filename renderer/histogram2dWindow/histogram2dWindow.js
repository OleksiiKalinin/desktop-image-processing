const { ipcRenderer } = require('electron');

ipcRenderer.on('histogram2d', (_, histogram2d) => {
    const wrapper = document.querySelector('.table');

    let tr = document.createElement('tr');
    tr.innerHTML += `<th index="head"></th>`;

    for (let i = 0; i < 256; ++i) tr.innerHTML += `<th index="head">${i}</th>`;

    wrapper.appendChild(tr)

    histogram2d.forEach((row, i) => {
        let tr = document.createElement('tr');
        tr.innerHTML += `<th index="body">${i}</th>`;

        row.forEach(col => {
            tr.innerHTML += `<td>${col}</td>`;
        });
        wrapper.appendChild(tr)
    });
    
    document.querySelector('p').remove();
});