const { ipcRenderer } = require('electron');


ipcRenderer.on('histogram2d', (_, histogram2d) => {
    const wrapper = document.querySelector('.table');

    let tableData = '';
    tableData += `
        <tr>
            <th index="head">
                <div class="table">
                    <table>
                        <tr>
                            <td width='50%'>&nbsp;</td>
                            <td width='50%'>after</td>
                        </tr>
                        <tr>
                            <td width='50%'>before</td>
                            <td width='50%'>&nbsp;</td>
                        </tr>
                    </table>
                </div>
                <div class="line"></div>
            </th>`;

    for (let i = 0; i < 256; ++i) tableData += `<th index="head">${i}</th>`;

    tableData += '</tr>';

    histogram2d.forEach((row, i) => {
        tableData += `<tr><th index="body">${i}</th>`;

        row.forEach(col => {
            tableData += `<td>${col}</td>`;
        });
        
        tableData += '</tr>';
    });
    
    wrapper.innerHTML = tableData;
    
    document.querySelector('p').remove();
});