module.exports = {
    root: 'site',
    //host: '::1',
    ignore: ['src/views/', /\.config.js$/i, /(build|galleries).js$/i],
    open: ['index.html'],
    cache: true,
    highlight: true, // enable highlight feature
    injectBody: true, // enable instant update
    remoteLogs: true, // enable remoteLogs
    remoteLogs: 'yellow', // enable remoteLogs and use the color yellow
    injectCss: true, // enable injecting css
    navigate: false, // enable auto-navigation
}
