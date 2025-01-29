const handlebars = require('handlebars')
const { minify } = require('@minify-html/node')
const { readFileSync, writeFileSync, readdirSync } = require('node:fs')
const { join } = require('node:path')
const galleries = require('./galleries.js')
const ourIPNS = 'ipns://k51qzi5uqu5djge84e0oh3d7cy5l03130126g6kfxquex2wxrozshpdg8nd1sg'
const wrappedLinkHelper = (text, url = '') => {
    let target = ''
    if (url !== ourIPNS && url.match(/^\w+?:\/\//gi)) {
        target = 'target="_blank"' // open external links in a new tab
    }

    return `&#xe007;<a href="${url}" ${target}>${text}</a>&#xe008;`
}
const prefixedLinkHelper = (text, url) => {
    let target = ''
    if (url !== ourIPNS && url.match(/^\w+?:\/\//gi)) {
        target = 'target="_blank"' // open external links in a new tab
    }
    return `<a href="${url}" ${target}>[ ${text} ]</a>`
}
handlebars.registerHelper('populategallery', (gallery) => {
    let galleryHTML = ''
    for (const img of gallery.images) {
        const src = `${gallery.tld}${img.url}`
        /// usse the image path without the file ext as the id
        const divID = img.url.split('.').reverse().slice(1).join('.')
        let source = `&#xe007;${img.credits || 'source unknown'}&#xe008;`
        if (img.sourceURL) {
            source = wrappedLinkHelper(img.credits || 'source', img.sourceURL)
        }
        galleryHTML +=
            `<div class="img-container" id="${divID}">` +
            `<a href="${src}">` +
            `<img src="${src}"/>` +
            '</a>' +
            (img.desc ? `<p class="img-desc">${img.desc} ${source}</p>` : '') +
            '</div>\n'
    }
    return galleryHTML.trim()
})
handlebars.registerHelper('wrappedlink', wrappedLinkHelper)
handlebars.registerHelper('hyperlink', prefixedLinkHelper)
handlebars.registerHelper('header', (maintext, subtext) => {
    if (typeof subtext === 'string') {
        subtext = subtext.trim().replace(/\\n/g, '<br>')
    }
    maintext = maintext.trim().replace(/\\n/g, '<br>')
    return `
    <div id='header'>
    <div>
        <h1>${handlebars.compile(maintext)()}</h1>
        ${typeof subtext === 'string' ? `<h2>${handlebars.compile(subtext)()}</h2>` : ''}
    </div>
    <hr />
    </div>
    `.trim()
})
handlebars.registerHelper('pawprint', () => {
    return pawprint
        .split(' ')
        .map((chunk, i) => `<span>${chunk}</span>${(i + 1) % 5 ? '' : '<br />'}`)
        .join(' ')
})
handlebars.registerHelper('cursorblink', () => {
    return "<span class='cursor-blink'>&#xe006;</span>"
})

process.chdir(__dirname)

const siteDir = join(__dirname, `./site`)
const viewsDir = join(siteDir, './src/views')
const layoutFileName = 'layout.handlebars'
const LAYOUT_FILE = readFileSync(`${viewsDir}/${layoutFileName}`, 'utf-8')
const LAYOUT = handlebars.compile(LAYOUT_FILE)
const pawprint = '36A5 ECBE 51A7 FFD2 DC82 7FE6 C8BB 0195 E47B 7CD6'

const DRY_RUN = process.env['DRY_RUN']

const DEFAULT_CTX = {
    themecolor: '#262638',
    author: '0xf0xx0',
}
const ctx = {
    index: {
        tabtitle: '⎇From one realm to another.',
        desc: 'doin stuff on the internet',
        stylesheets: ['<link rel="stylesheet" type="text/css" href="src/styles/webrings.css" />'],
    },
    'cyberspace-independence': {
        tabtitle: 'A Declaration of the Independence of Cyberspace',
        desc:
            '"A Declaration of the Independence of Cyberspace" is a widely distributed early paper ' +
            'on the applicability (or lack thereof) of government to the rapidly growing Internet. ' +
            'Commissioned for the pioneering Internet project 24 Hours in Cyberspace, ' +
            'it was written by John Perry Barlow, a founder of the Electronic Frontier Foundation, ' +
            'and published online on February 8, 1996, from Davos, Switzerland.',
        author: 'John Perry Barlow',
        keywords: ['cyberspace', 'independence'],
    },
    pixelsorts: {
        tabtitle: 'Pixels Placed in (Dis)Order',
        desc: 'organic Home-grown free-range pixelsorts',
        stylesheets: ['<link rel="stylesheet" type="text/css" href="src/styles/gallery.css" />'],
        galleryImages: galleries.pixelsorts,
        keywords: ['pixelsorting', 'pixelsort', 'glitch art'],
        image: 'https://0xf0xuments.0xf0xx0.eth.limo/pixelsort-gens/boat-on-lake/final.jpg',
        imageDims: { width: 1000, height: 1500 },
    },
    eve: {
        tabtitle: 'Screenshots in Space',
        desc: "When i'm not dyin, i'm killin and then dyin",
        stylesheets: ['<link rel="stylesheet" type="text/css" href="src/styles/gallery.css" />'],
        galleryImages: galleries.eve,
        keywords: ['eve online', 'screenshots'],
        image: 'https://0xf0xuments.0xf0xx0.eth.limo/eve-screenshots/CataclysmicVariable.png',
        imageDims: { width: 1280, height: 800 },
    },
    flags: {
        tabtitle: 'Unified-pride-flags Flag Previews',
        desc: 'Previews of the flags included in unified-pride-flags.',
        author: '@KonkenBonken, @0xf0xx0 (GitHub)',
        stylesheets: ['<link rel="stylesheet" type="text/css" href="src/styles/flags.css" />'],
        keywords: ['unified pride flags', 'cli pride flags', 'lgbtqia'],
    },
    404: { tabtitle: 'Are You Lost? (404)', desc: 'Were you ever Found?' },
}
function compileToHTML(page) {
    const template = readFileSync(`${viewsDir}/${page}`, 'utf-8')
    const templateName = page.split('.')[0]
    const extra = {
        ...DEFAULT_CTX,
        page: `${templateName}.html`,
        ...ctx[templateName],
    }
    extra.stylesheets ? (extra.stylesheets = extra.stylesheets.join('')) : null
    let keywords = [
        '⎇',
        'ΘΔ',
        'alterbeing',
        'theriomythic',
        'nonhuman',
        '0xf0xx0',
        'ens',
        'web3',
        'true web3',
        'assegai',
        'cypherpunk',
    ]
    if (extra.keywords) {
        keywords.push(...extra.keywords)
    }
    extra.keywords = keywords

    const body = handlebars.compile(template)

    return {
        name: extra.page,
        content: LAYOUT({ body: body(extra), ...extra }),
    }
}

const views = readdirSync(viewsDir)

for (const view of views.filter((v) => v.endsWith('.handlebars'))) {
    if ([layoutFileName].includes(view)) {
        continue
    }
    const page = compileToHTML(view)
    try {
        if (!DRY_RUN) {
            const minified = minify(Buffer.from(page.content), {}).toString('utf8')
            writeFileSync(`${siteDir}/${page.name}`, minified)
        }
        console.log(view)
    } catch (e) {
        fatalError(e)
    }
}

function fatalError(e) {
    console.error(e)
    process.exit(1)
}
