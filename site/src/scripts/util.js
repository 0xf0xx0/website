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
