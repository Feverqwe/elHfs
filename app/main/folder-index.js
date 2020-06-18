const Fs = require('fs');
const Path = require('path');
const escapeHtmlInJson = require('./tools/escapeHtmlInJson');
const parallel = require('./tools/parallel');

function expressIndex(root) {
    if (!root) throw new TypeError('Root path required');

    const rootPath = Path.normalize(Path.resolve(root) + Path.sep);
    const template = Fs.readFileSync(Path.join(__dirname, './template/folder/folder.html')).toString();

    return async (req, res, next) => {
        const dir = decodeURIComponent(req.path);

        const path = Path.normalize(Path.join(rootPath, dir));
        if (path.indexOf('\0') !== -1) {
            return res.sendStatus(400);
        }
        if ((path + Path.sep).substr(0, rootPath.length) !== rootPath) {
            return res.sendStatus(403);
        }

        let dirFiles = null;
        try {
            dirFiles = await Fs.promises.readdir(path);
        } catch (err) {
            // pass
        }

        if (!dirFiles) {
            return res.sendStatus(404);
        }

        const dirList = [];

        await parallel(10, dirFiles, async (name) => {
            let stat = null;
            try {
                stat = await Fs.promises.stat(Path.join(path, name));
            } catch (err) {
                // pass
            }

            if (!stat) return;

            const file = {
                name,
                isDir: stat.isDirectory(),
                ctime: stat.ctime.getTime(),
                size: stat.size,
            };

            dirList.push(file);
        });

        dirList.sort(({ctime: a}, {ctime: b}) => {
            return a === b ? 0 : a > b ? -1 : 1;
        });

        dirList.sort(({isDir: a}, {isDir: b}) => {
            return a === b ? 0 : a ? -1 : 1;
        });

        const rootStore = {
            dir,
            isRoot: rootPath === path,
            files: dirList,
        };

        const body = template
          .replace('{{TITLE}}', `Index of ${escapeHtmlInJson(dir)}`)
          .replace('<script id="root_store"></script>', `<script id="root_store">window.ROOT_STORE=${escapeHtmlInJson(JSON.stringify(rootStore))}</script>`);

        res.send(body);
    };
}

module.exports = expressIndex;