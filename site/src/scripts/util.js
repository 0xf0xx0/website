function addBlankToLinks() {
    const links = document.getElementsByTagName('a')
    // MAYBE: ipns as well?
    const thisDomain = 'https://0xf0xx0.eth.limo'
    for (const a of links) {
        if (a.href.startsWith('https://') && !a.href.startsWith(thisDomain)) {
            a.target = '_blank' // open external links in a new tab
        }
    }
}

function getAllTextElms() {
    // not really *all* text elms, but the ones used on this site lol
    const textElems = [
        ...document.getElementsByTagName('p'),
        ...document.getElementsByTagName('span'),
        ...document.getElementsByTagName('a'),
        ...document.getElementsByTagName('h1'),
        ...document.getElementsByTagName('h2'),
        ...document.getElementsByTagName('h3'),
        ...document.getElementsByTagName('pre'),
    ]
    return textElems
}

async function copy(elm, config) {
    if (!elm) {
        return alert("The element to copy doesn't exist.")
    }
    if (navigator.clipboard) {
        let text = elm.innerText
        if (config?.trimNewlines) {
            text = text.replace(/\n/g, ' ')
        }
        if (config?.removeSpaces) {
            text = text.replace(/ /g, '')
        }
        await navigator.clipboard.writeText(text)
        return
    } else {
        return alert("Your browser doesn't support the Clipboard API!")
    }
}

// MAYBE: display different messages for ipfs and clearnet?
function checkDomain() {
    const url = window.location
    if (url.protocol === 'ipfs:') {
    }
}

/// amazing name, eh?
function errorCleaner(err) {
    err.stack = err.stack.replace(new RegExp(`${window.location.origin}/`, 'gi'), '')
    return `${err}\n${err.stack}`
}
