import path from 'path';
import fs from 'fs';

const isDev = process.env.NODE_ENV !== 'production';
const styles = [];
const scripts = [];
const title = 'Demo websocket chat';

if (isDev) {
    scripts.push('<script src="//localhost:9000/main.bundle.js"></script>');
} else {
    try {
        const assetsFile = fs.readFileSync(path.join(__dirname, '../assets.json'));
        const assets = JSON.parse(assetsFile);
        Object.keys(assets).forEach(key => {
            const chunk = assets[key];
            if (chunk.js) {
                scripts.push(`<script src="${chunk.js}"></script>`);
            }
            if (chunk.css) {
                styles.push(`<link rel="stylesheet" href="${chunk.css}">`);
            }
        });
    } catch (error) {
        // TODO: Redirect to error page
        console.log(error); // eslint-disable-line no-console
    }
}

const layout = `
<!DOCTYPE html>
<html>
    <head>
        <link rel="icon" href="favicon.ico">
        <link rel="icon" type="image/png" sizes="196x196" href="icon-196x196.png">
        <link rel="apple-touch-icon" type="image/png" href="icon-196x196.png">
        ${styles.join('')}
        <title>${title}</title>
    </head>
    <body>
        <div id="app-root" class="app-root"></div>
        ${scripts.join('')}
    </body>
</html>
`;

export default async function renderer(ctx, next) {
    ctx.body = layout;
    ctx.type = 'text/html';
    next();
}
