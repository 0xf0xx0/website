const flagContainer = document.getElementById('flag-container')
async function buildFlags() {
    let flagHTML = ''
    flagContainer.innerHTML = '<span>Loading...</span>'
    const FLAGS = await (
        await fetch(
            'https://raw.githubusercontent.com/0xf0xx0/unified-pride-flags/fluffy/generated/unified-flags.json'
        )
    ).json()
    for (const [name, flag] of Object.entries(FLAGS)) {
        let flagDiv = `<div class="flag" id="${name}">\n`
        for (let i = 0; i < flag.stripes.length; i++) {
            const stripe = flag.stripes[i]
            const weight = flag.weights?.[i] || 1
            flagDiv += `<div class="flag-stripe" style="background-color:${stripe};flex:${weight}"></div>\n`
        }
        flagDiv += `<h3>${name}</h3>\n</div>`
        flagHTML += flagDiv
    }
    flagContainer.innerHTML = flagHTML
}
buildFlags().catch((e) => {
    flagContainer.innerText = errorCleaner(e)
})
