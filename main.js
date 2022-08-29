const { app, BrowserWindow, session } = require('electron')

function createWindow() {
    session.defaultSession.webRequest.onBeforeRequest({
        urls: [
            'https://embed.twitch.tv/*channel=*'
        ]
    }, (details, cb) => {
        var redirectURL = details.url;

        var params = new URLSearchParams(redirectURL.replace('https://embed.twitch.tv/',''));
        if (params.get('parent') != '') {
            cb({});
            return;
        }
        params.set('parent', 'locahost');
        params.set('referrer', 'https://localhost/');

        var redirectURL = 'https://embed.twitch.tv/?' + params.toString();
        console.log('Adjust to', redirectURL);

        cb({
            cancel: false,
            redirectURL
        });
    });

    // works for dumb iFrames
    session.defaultSession.webRequest.onHeadersReceived({
        urls: [
            'https://www.twitch.tv/*',
            'https://player.twitch.tv/*',
            'https://embed.twitch.tv/*'
        ]
    }, (details, cb) => {
        var responseHeaders = details.responseHeaders;

        console.log('headers', details.url, responseHeaders);

        delete responseHeaders['Content-Security-Policy'];
        //console.log(responseHeaders);

        cb({
            cancel: false,
            responseHeaders
        });
    });
    const win = new BrowserWindow({
        width: 800,
        height: 600
    })
    win.loadFile('index.html')
}

app.whenReady().then(createWindow)