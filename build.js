const handlebars = require('handlebars')
const { minify } = require('@minify-html/node')
const { readFileSync, writeFileSync, readdirSync } = require('node:fs')
const { join } = require('node:path')
const galleries = require('./galleries.js')
const yaml = require('yaml')
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
handlebars.registerHelper('concat', (...arguments) => {
    return arguments.slice(0, -1).join('')
})
handlebars.registerHelper('populategallery', ({ data }) => {
    let galleryHTML = ''
    const gallery = galleries[data.root.page]
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
handlebars.registerHelper('svg', (path) => {
    return `<div class="svgcont">${readFileSync(join(__dirname, '/site/', path))}</div>`
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
function compileToHTML(page) {
    const file = readFileSync(`${viewsDir}/${page}`, 'utf-8')
    const fileName = page.split('.')[0]

    const [_, frontmatter, template] = file.match(/^---\n([\s\S]+)---([\s\S]+)$/)
    const metadata = yaml.parse(frontmatter)
    const body = handlebars.compile(template)

    const extra = {
        ...DEFAULT_CTX,
        ...metadata,
        page: fileName,
        path: fileName === 'index' ? '' : `${fileName}.html`
    }
    extra.stylesheets
        ? (extra.stylesheets = extra.stylesheets
              .map((v) => `<link rel="stylesheet" type="text/css" href="src/styles/${v}.css"/>`)
              .join(''))
        : null
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

    return {
        name: extra.page,
        content: LAYOUT({ body: body(extra), ...extra }),
        frontmatter,
    }
}

const views = readdirSync(viewsDir)

for (const view of views.filter((v) => v.endsWith('.handlebars'))) {
    if ([layoutFileName].includes(view)) {
        continue
    }
    const page = compileToHTML(view)
    const minified = minify(Buffer.from(page.content), {}).toString('utf8')
    try {
        if (!DRY_RUN) {
            writeFileSync(`${siteDir}/${page.name}.html`, minified)
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
