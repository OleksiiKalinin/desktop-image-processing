const { ipcRenderer } = require('electron');

ipcRenderer.on('histogram2d', (_, histogram2d) => {
    const wrapper = document.querySelector('.table');

    let tr = document.createElement('tr');
    tr.innerHTML += `<th></th>`;

    for (let i = 0; i < 256; ++i) tr.innerHTML += `<th>${i}</th>`;

    wrapper.appendChild(tr)

    histogram2d.forEach((row, i) => {
        let tr = document.createElement('tr');
        tr.innerHTML += `<td style="font-weight: 900;">${i}</td>`;

        row.forEach(col => {
            tr.innerHTML += `<td>${col}</td>`;
        });
        wrapper.appendChild(tr)
    });
    
    document.querySelector('p').remove();
});