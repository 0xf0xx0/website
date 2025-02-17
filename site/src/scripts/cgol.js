/**
    conways game of life in a favicon
    shoot me a email if you make tweaks, i want ideas :3
**/

function cgol(field = null, dims) {
    const fieldWidth = field.length
    const fieldHeight = field[0].length

    let newField = generateEmptyField(dims)
    for (let i = 0; i < fieldHeight; i++) {
        for (let ii = 0; ii < fieldWidth; ii++) {
            /// cell check!
            let liveNeighbors = 0
            /// furst, check neighbors w/ wraparound
            /// top and bottom
            liveNeighbors += field[ii]?.[i - 1] === undefined ? field[ii][fieldHeight - 1] : field[ii][i - 1]
            liveNeighbors += field[ii]?.[i + 1] === undefined ? field[ii][0] : field[ii][i + 1]
            /// left and right
            liveNeighbors += field[ii - 1]?.[i] === undefined ? field[fieldWidth - 1][i] : field[ii - 1][i]
            liveNeighbors += field[ii + 1]?.[i] === undefined ? field[0][i] : field[ii + 1][i]
            /// and now diagonals
            let posIdx = (ii + 1) % fieldWidth
            let negIdx = ii - 1
            if (negIdx === -1) {
                negIdx = fieldWidth - 1
            }
            liveNeighbors +=
                field[negIdx]?.[i - 1] === undefined ? field[negIdx][fieldHeight - 1] : field[negIdx][i - 1]
            liveNeighbors += field[negIdx]?.[i + 1] === undefined ? field[negIdx][0] : field[negIdx][i + 1]
            liveNeighbors +=
                field[posIdx]?.[i - 1] === undefined ? field[posIdx][fieldHeight - 1] : field[posIdx][i - 1]
            liveNeighbors += field[posIdx]?.[i + 1] === undefined ? field[posIdx][0] : field[posIdx][i + 1]

            /// guess i'll Optional<die>
            const isAlive = !!field[ii][i]
            if (isAlive) {
                /// "Any live cell with two or three live neighbours lives on to the next generation."
                if (liveNeighbors <= 3 && liveNeighbors >= 2) {
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
    const fieldWidth = field.length
    const fieldHeight = field[0].length

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background-color')
    const fillColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color')
    ctx.fillRect(0, 0, dims * pixelSize, dims * pixelSize)
    for (let i = 0; i < fieldHeight; i++) {
        for (let ii = 0; ii < fieldWidth; ii++) {
            const isAlive = !!field[ii][i]
            if (isAlive) {
                ctx.fillStyle = fillColor
            } else {
                ctx.fillStyle = 'black'
            }
            ctx.fillRect(ii * pixelSize, i * pixelSize, pixelSize, pixelSize)
        }
    }
    return ctx
}
function generateEmptyField(dims) {
    let field = Array(dims)
    for (let i = 0; i < field.length; i++) {
        field[i] = Array(dims).fill(0)
    }
    return field
}
function bigintToBin(bigint) {
    return (bigint >> 0n).toString(2)
}
async function digestMessage(message) {
    if (!window.crypto) {
        /// bruh, are you a dinosaur?
        console.error("window.crypto doesn't exist, use a modern browser ya dingus!")
        return undefined /// make sure everything breaks too
    }
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
}
async function seedField(seed, field) {
    const fieldWidth = field.length
    const fieldHeight = field[0].length
    const cellCount = fieldWidth * fieldHeight

    seed = await digestMessage(seed)

    /// expand
    /// this very quickly breaks the BigInt limit at scale,
    /// good thing this is only for a favicon
    while (seed.length <= Math.ceil(cellCount / 4)) {
        //console.log(seed.length, seed)
        seed += await digestMessage(seed)
    }

    /// turn into binary string
    seed = bigintToBin(BigInt('0x' + seed))
    if (seed.length > cellCount) {
        /// grab the last bytes
        seed = seed.slice(-cellCount)
    }

    for (let i = 0; i < fieldHeight; i++) {
        for (let ii = 0; ii < fieldWidth; ii++) {
            let idx = i * fieldWidth + ii
            field[ii][i] = parseInt(seed[idx])
        }
    }
    return field
}
function compareStates(A, B) {
    const fieldWidth = A.length
    const fieldHeight = A[0].length
    let diff = 0
    for (let i = 0; i < fieldHeight; i++) {
        for (let ii = 0; ii < fieldWidth; ii++) {
            if (A[ii][i] !== B[ii][i]) {
                diff++
            }
        }
    }
    return diff
}

const params = new URLSearchParams(window.location.search)
const dims = 64
const pixelSize = 1
const tickMS = parseInt(params.get('cgoltickms')) || 300

const icon = document.querySelector('link[rel="icon"]')
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
canvas.width = dims * pixelSize
canvas.height = dims * pixelSize

/// not tracking you i swear, this is for seeding the game
/// if you havent seen already, look in the favicon
/// most visitors get a unique favicon :3
let seedstring = '0'
if (navigator) {
    seedstring = navigator.userAgent
    seedstring += navigator.language
    seedstring += navigator.buildID
    seedstring += navigator.oscpu
    seedstring += navigator.hardwareConcurrency
    seedstring += navigator.maxTouchPoints
    seedstring += window.devicePixelRatio
}
seedstring = seedstring.replace(/\s/g, '')
seedField(seedstring, generateEmptyField(dims)).then((field) => {
    let state = field
    let iters = 0
    /// lower thresh = less alive at the end
    const stopThreshold = Math.ceil(dims * dims * 0.06)

    window.addEventListener(
        'load',
        () => {
            /// draw
            drawField(state, ctx)
            updateFavicon(canvas.toDataURL())

            const inter = setInterval(() => {
                let oldstate = state
                state = cgol(state, dims)
                /// keep going until we stabilize
                drawField(state, ctx)
                updateFavicon(canvas.toDataURL())
                if (compareStates(oldstate, state) < stopThreshold) {
                    clearInterval(inter)
                }
                iters++
            }, tickMS)
        },
        false
    )
})

function updateFavicon(newImg) {
    if (!newImg) {
        return
    }
    icon.href = newImg
}
