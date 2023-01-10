import path = require("path")

export const DataPath = {
    templateCss   : path.join('static', 'style.css'),
    templateHtml  : path.join('static', 'index.html'),

    jsonMeta      : path.join('temp', 'meta.json'),
    read_data_json: path.join('temp','read_data.json'),
};

export const scriptpath = {
    monitorjs     : path.join('static', 'monitor.js'),
    scroll_testjs : path.join('static', 'scroll_test.js'),
    showtimejs    : path.join('static', 'showtime.js'),
}

export const csspath = {
    reader_css    : path.join('static', 'style.css'),
}
