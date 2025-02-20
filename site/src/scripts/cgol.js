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
            liveNeighbors += field[ii]?.[i - 1] === undefined ? field[ii][dims - 1] : field[ii][i - 1]
            liveNeighbors += field[ii]?.[i + 1] === undefined ? field[ii][0] : field[ii][i + 1]
            /// left and right
            liveNeighbors += field[ii - 1]?.[i] === undefined ? field[dims - 1][i] : field[ii - 1][i]
            liveNeighbors += field[ii + 1]?.[i] === undefined ? field[0][i] : field[ii + 1][i]
            /// and now diagonals
            let posIdx = (ii + 1) % dims
            let negIdx = ii - 1
            if (negIdx === -1) {
                negIdx = dims - 1
            }
            liveNeighbors += field[negIdx]?.[i - 1] === undefined ? field[negIdx][dims - 1] : field[negIdx][i - 1]
            liveNeighbors += field[negIdx]?.[i + 1] === undefined ? field[negIdx][0] : field[negIdx][i + 1]
            liveNeighbors += field[posIdx]?.[i - 1] === undefined ? field[posIdx][dims - 1] : field[posIdx][i - 1]
            liveNeighbors += field[posIdx]?.[i + 1] === undefined ? field[posIdx][0] : field[posIdx][i + 1]

            /// guess i'll Optional<die>
            if (!!field[ii][i]) {
                /// "Any live cell with two or three live neighbours lives on to the next generation."
                if (liveNeighbors === 2 || liveNeighbors === 3) {
                    newField[ii][i] = field[ii][i]
                } else {
                    newField[ii][i] = 0
                }
            } else {
                /// we ded bish
                if (liveNeighbors === 3) {
                    /// LAZARUS??????? :MaryPog:
                    newField[ii][i] = 1
                }
            }
        }
    }
    return newField
}
function drawField(field, ctx) {
    for (let i = 0; i < dims; i++) {
        for (let ii = 0; ii < dims; ii++) {
            ctx.fillStyle = !!field[ii][i] ? fgColor : bgColor
            ctx.fillRect(ii * pixelSize, i * pixelSize, pixelSize, pixelSize)
        }
    }
    return ctx
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
    seed = await digestSeedString(seed)
    const rng = splitmix32(seed)
    for (let i = 0; i < dims; i++) {
        for (let ii = 0; ii < dims; ii++) {
            field[ii][i] = rng() > 0.6
        }
    }
    return field
}
function compareStates(A, B) {
    let diff = 0
    for (let i = 0; i < dims; i++) {
        for (let ii = 0; ii < dims; ii++) {
            if (A[ii][i] !== B[ii][i]) {
                diff++
            }
        }
    }
    return diff
}

const params = new URLSearchParams(window.location.search)
const dims = 32
const pixelSize = 4
const tickMS = parseInt(params.get('cgoltickms')) || 300

const icon = document.querySelector('link[rel="icon"]')
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
let bgColor, fgColor
canvas.width = dims * pixelSize
canvas.height = dims * pixelSize

/// not tracking you i swear, this is for seeding the game
/// if you havent seen already, look in the favicon
/// most visitors get a unique favicon :3
let seedstring = navigator.userAgent
seedstring += navigator.hardwareConcurrency
seedstring += navigator.maxTouchPoints
seedstring += window.devicePixelRatio
seedstring += navigator.language
seedstring += navigator.buildID
seedstring += location.hostname
seedstring += navigator.oscpu

seedstring = seedstring.replace(/\s/g, '')
seedField(seedstring, generateEmptyField(dims)).then((field) => {
    let state = field
    /// lower thresh = less alive at the end
    const stopThreshold = Math.ceil(dims * dims * 0.06)

    window.addEventListener(
        'load',
        () => {
            bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background-color')
            fgColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color')
            /// draw
            drawField(state, ctx)
            updateFavicon(canvas.toDataURL())

            const inter = setInterval(() => {
                let oldstate = state
                state = cgol(state)
                /// keep going until we stabilize
                drawField(state, ctx)
                updateFavicon(canvas.toDataURL())
                if (compareStates(oldstate, state) < stopThreshold) {
                    clearInterval(inter)
                }
            }, tickMS)
        },
        false
    )
})

function updateFavicon(newImg) {
    icon.href = newImg
}
