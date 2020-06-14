const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const filesize = require('filesize');
const normalize = path.normalize;
const sep = path.sep;
const extname = path.extname;
const join = path.join;
const resolve = path.resolve;

function expressIndex(root, options = {}) {
    options.theme = options.theme || "default";
    const theme = fs.readdirSync(join(__dirname, 'render/style'));

    let css = ".no-style-defined{}";
    if (theme.indexOf(`${options.theme}.css`) !== -1) {
        css = fs.readFileSync(
          join(__dirname, `render/style/${options.theme}.css`)
        );
    }

    if (!root) throw new TypeError('Root path required');
    const rootPath = normalize(resolve(root) + sep);

    return (req, res, next) => {
        const dir = decodeURIComponent(req.path);

        const path = normalize(join(rootPath, dir));
        if (path.indexOf('\0') !== -1) {
            return res.sendStatus(400);
        }
        if ((path + sep).substr(0, rootPath.length) !== rootPath) {
            return res.sendStatus(403);
        }

        let html = "";

        if (!fs.existsSync(path)) {
            return res.sendStatus(404);
        }

        const dirList = [];
        fs.readdirSync(path).forEach((name) => {
            let stat = null;
            try {
                stat = fs.statSync(join(path, name));
            } catch (err) {
                // pass
            }

            if (!stat) return;

            let hSize = '-';
            try {
                if (stat.size > 0) {
                    hSize = filesize(stat.size);
                }
            } catch (err) {
                // pass
            }

            const file = {
                name,
                url: encodeURIComponent(name),
                type: stat.isDirectory() ? 'dir' : extname(name).toLowerCase().substr(1),
                ctime: stat.ctime,
                ctimeStr: dateStr(stat.ctime),
                size: hSize,
            };

            dirList.push(file);
        });

        dirList.sort(({ctime: aa}, {ctime: bb}) => {
            const a = aa.getTime();
            const b = bb.getTime();
            return a === b ? 0 : a > b ? -1 : 1;
        });

        dirList.sort(({type: a}, {type: b}) => {
            return a === b ? 0 : a === 'dir' ? -1 : 1;
        });

        dirList.forEach((file) => {
            ejs.renderFile(
              join(__dirname, "render/file.ejs"),
              {file},
              {},
              (err, str) => {
                  html += str;
              }
            );
        });

        res.render(
          join(__dirname, "render/directory.ejs"),
          {
              contents: html,
              indexName: dir,
              isRoot: rootPath === path,
              css: css
          }
        );
    };
}

function dateStr(date) {
    const dateStr = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(v => (v < 10 ? '0' : '') + v).join('-');
    const timeStr = [date.getHours(), date.getMinutes(), date.getSeconds()].map(v => (v < 10 ? '0' : '') + v).join('-');
    return `${dateStr} ${timeStr}`;
}

module.exports = expressIndex;