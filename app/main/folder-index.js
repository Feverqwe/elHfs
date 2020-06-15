const Fs = require('fs');
const Path = require('path');
const escapeHtmlInJson = require('./tools/escapeHtmlInJson');

function expressIndex(root) {
    if (!root) throw new TypeError('Root path required');

    const rootPath = Path.normalize(Path.resolve(root) + Path.sep);
    const template = Fs.readFileSync(Path.join(__dirname, './template/folder/folder.html')).toString();

    return (req, res, next) => {
        const dir = decodeURIComponent(req.path);

        const path = Path.normalize(Path.join(rootPath, dir));
        if (path.indexOf('\0') !== -1) {
            return res.sendStatus(400);
        }
        if ((path + Path.posix.sep).substr(0, rootPath.length) !== rootPath) {
            return res.sendStatus(403);
        }

        let dirFiles = null;
        try {
            dirFiles = Fs.readdirSync(path);
        } catch (err) {
            // pass
        }

        if (!dirFiles) {
            return res.sendStatus(404);
        }

        const dirList = [];
        dirFiles.forEach((name) => {
            let stat = null;
            try {
                stat = Fs.statSync(Path.join(path, name));
            } catch (err) {
                // pass
            }

            if (!stat) return;

            const file = {
                name,
                type: stat.isDirectory() ? 'dir' : Path.extname(name).toLowerCase().substr(1),
                ctime: stat.ctime.getTime(),
                size: stat.size,
            };

            dirList.push(file);
        });

        dirList.sort(({ctime: a}, {ctime: b}) => {
            return a === b ? 0 : a > b ? -1 : 1;
        });

        dirList.sort(({type: a}, {type: b}) => {
            return a === b ? 0 : a === 'dir' ? -1 : 1;
        });

        const body = template.replace('<script id="root_store"></script>', `<script id="root_store">window.ROOT_STORE=${escapeHtmlInJson(JSON.stringify({
            dir,
            isRoot: rootPath === path,
            files: dirList,
        }))}</script>`);

        res.send(body);
    };
}

module.exports = expressIndex;