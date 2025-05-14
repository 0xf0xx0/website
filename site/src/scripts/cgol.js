/**
    conways game of life in a favicon
    shoot me a email if you make tweaks, i want ideas :3
**/

function cgol(field) {
    let newField = generateEmptyField(dims)
    for (let i = 0; i < dims; i++) {
        for (let ii = 0; ii < dims; ii++) {
            /// cell check!
            let liveNeighbors = 0
            /// furst, check neighbors w/ wraparound
            /// top and bottom
            liveNeighbors += field[ii]?.[i - 1] === undefined ? field[ii][dims - 1] > 0 : field[ii][i - 1] > 0
            liveNeighbors += field[ii]?.[i + 1] === undefined ? field[ii][0] > 0 : field[ii][i + 1] > 0
            /// left and right
            liveNeighbors += field[ii - 1]?.[i] === undefined ? field[dims - 1][i] > 0 : field[ii - 1][i] > 0
            liveNeighbors += field[ii + 1]?.[i] === undefined ? field[0][i] > 0 : field[ii + 1][i] > 0
            /// and now diagonals
            let posIdx = (ii + 1) % dims
            let negIdx = ii - 1
            if (negIdx === -1) {
                negIdx = dims - 1
            }
            liveNeighbors += field[negIdx]?.[i - 1] === undefined ? field[negIdx][dims - 1] > 0 : field[negIdx][i - 1] > 0
            liveNeighbors += field[negIdx]?.[i + 1] === undefined ? field[negIdx][0] > 0 : field[negIdx][i + 1] > 0
            liveNeighbors += field[posIdx]?.[i - 1] === undefined ? field[posIdx][dims - 1] > 0 : field[posIdx][i - 1] > 0
            liveNeighbors += field[posIdx]?.[i + 1] === undefined ? field[posIdx][0] > 0 : field[posIdx][i + 1] > 0

            /// guess i'll Optional<die>
            if (field[ii][i] > 0) {
                /// "Any live cell with two or three live neighbours lives on to the next generation."
                if (liveNeighbors === 2 || liveNeighbors === 3) {
                    newField[ii][i] = 1
                } else {
                    newField[ii][i] = -1
                }
            } else {
                /// we ded bish
                if (liveNeighbors === 3) {
                    /// LAZARUS??????? :MaryPog:
                    newField[ii][i] = 1
                } else {
                    if (field[ii][i] < 0) {
                        newField[ii][i] = field[ii][i] - 1
                    }
                    if (field[ii][i] < -3) {
                        newField[ii][i] = 0
                    }
                }
            }
        }
    }
    return newField
}
function drawField(oldfield, field) {
    let diff = 0
    for (let i = 0; i < dims; i++) {
        for (let ii = 0; ii < dims; ii++) {
            if (oldfield[ii][i] !== field[ii][i]) {
                diff++
            }
            ctx.fillStyle = !!field[ii][i] ? `hsl(from ${fgColor} h s ${(50 + (12*field[ii][i]))}%)` : `hsl(from ${bgColor} h s l)`
            ctx.fillRect(ii * pixelSize, i * pixelSize, pixelSize, pixelSize)
        }
    }
    icon.href = canvas.toDataURL()
    return diff
}
function generateEmptyField() {
    let field = Array(dims)
    for (let i = 0; i < dims; i++) {
        field[i] = Array(dims).fill(0)
    }
    return field
}
async function digestSeedString(message) {
    if (!window.crypto) {
        /// bruh, are you a dinosaur?
        console.error("window.crypto doesn't exist, use a modern browser ya dingus!")
        return undefined /// make sure everything breaks too
    }
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const hashBuffer = await window.crypto.subtle.digest('SHA-1', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
    return parseInt('0x'+hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')) // convert bytes to hex string
}
/// https://stackoverflow.com/a/47593316
/// math! i dont understand it
function splitmix32(a) {
    return function () {
        a |= 0
        a = (a + 0x9e3779b9) | 0
        let t = a ^ (a >>> 16)
        t = Math.imul(t, 0x21f0aaad)
        t = t ^ (t >>> 15)
        t = Math.imul(t, 0x735a2d97)
        return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296
    }
}
async function seedField(seed, field) {
    const rng = splitmix32(await digestSeedString(seed))
    for (let i = 0; i < dims; i++) {
        for (let ii = 0; ii < dims; ii++) {
            field[ii][i] = rng() > 0.6
        }
    }
    return field
}

const params = new URLSearchParams(window.location.search)
const dims = 16
const stopThresh = 0.25
const pixelSize = 16
const tickMS = parseInt(params.get('cgoltickspeed')) || 300

const icon = document.querySelector('link[rel="icon"]')
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
let bgColor, fgColor
canvas.width = dims * pixelSize
canvas.height = dims * pixelSize
const contdiv = document.createElement('div')

/// not tracking you i swear, this is for seeding the game
/// if you havent seen already, look in the favicon
/// most visitors get a unique favicon :3
const seedstring = `${navigator.userAgent}${navigator.hardwareConcurrency}${navigator.maxTouchPoints}`
    + `${window.devicePixelRatio}${navigator.language}`
    + `${new Date().getTimezoneOffset()}${navigator.buildID}${location.hostname}`
    + `${navigator.oscpu}`

seedField(seedstring, generateEmptyField(dims)).then((state) => {
    /// lower thresh = less alive at the end
    const minUpdates = Math.ceil(dims * dims * stopThresh)

    window.addEventListener(
        'load',
        () => {
            const computedStyle = getComputedStyle(document.documentElement)
            bgColor = computedStyle.getPropertyValue('--background-color')
            fgColor = computedStyle.getPropertyValue('--text-color')
            /// draw
            drawField(state, state)

            /// keep going until we stabilize
            const inter = setInterval(() => {
                [oldstate, state] = [state, cgol(state)]
                if (drawField(oldstate, state) <= minUpdates) {
                    clearInterval(inter)
                }
            }, tickMS)
        },
        false
    )
})
