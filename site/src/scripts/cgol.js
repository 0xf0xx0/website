/**
    conways game of life in a favicon
    shoot me a email if you make tweaks, i want ideas :3
**/

function cgol(field) {
    let newField = generateEmptyField(dims);
    for (let i = 0; i < dims; i++) {
        for (let ii = 0; ii < dims; ii++) {
            /// cell check!
            let liveNeighbors = 0;
            /// furst, check neighbors w/ wraparound
            /// top and bottom
            liveNeighbors +=
                field[ii]?.[i - 1] === undefined
                    ? field[ii][dims - 1] > 0
                    : field[ii][i - 1] > 0;
            liveNeighbors +=
                field[ii]?.[i + 1] === undefined
                    ? field[ii][0] > 0
                    : field[ii][i + 1] > 0;
            /// left and right
            liveNeighbors +=
                field[ii - 1]?.[i] === undefined
                    ? field[dims - 1][i] > 0
                    : field[ii - 1][i] > 0;
            liveNeighbors +=
                field[ii + 1]?.[i] === undefined
                    ? field[0][i] > 0
                    : field[ii + 1][i] > 0;
            /// and now diagonals
            let posIdx = (ii + 1) % dims;
            let negIdx = ii - 1;
            if (negIdx === -1) {
                negIdx = dims - 1;
            }
            liveNeighbors +=
                field[negIdx]?.[i - 1] === undefined
                    ? field[negIdx][dims - 1] > 0
                    : field[negIdx][i - 1] > 0;
            liveNeighbors +=
                field[negIdx]?.[i + 1] === undefined
                    ? field[negIdx][0] > 0
                    : field[negIdx][i + 1] > 0;
            liveNeighbors +=
                field[posIdx]?.[i - 1] === undefined
                    ? field[posIdx][dims - 1] > 0
                    : field[posIdx][i - 1] > 0;
            liveNeighbors +=
                field[posIdx]?.[i + 1] === undefined
                    ? field[posIdx][0] > 0
                    : field[posIdx][i + 1] > 0;

            /// guess i'll Optional<die>
            if (field[ii][i] > 0) {
                /// "Any live cell with two or three live neighbours lives on to the next generation."
                if (liveNeighbors === 2 || liveNeighbors === 3) {
                    newField[ii][i] = 1;
                } else {
                    newField[ii][i] = -1;
                }
            } else {
                /// we ded bish
                if (liveNeighbors === 3) {
                    /// LAZARUS??????? :MaryPog:
                    newField[ii][i] = 1;
                } else {
                    /// time decay
                    if (field[ii][i] < 0) {
                        newField[ii][i] = field[ii][i] - 1;
                    }
                    if (field[ii][i] < -3) {
                        newField[ii][i] = 0;
                    }
                }
            }
        }
    }
    return newField;
}
function drawField(oldfield, field) {
    let diff = 0;
    for (let i = 0; i < dims; i++) {
        for (let ii = 0; ii < dims; ii++) {
            if (oldfield[ii][i] !== field[ii][i]) {
                diff++;
            }
            ctx.fillStyle = !!field[ii][i]
                ? `hsl(from ${fgColor} h s ${50 + 12 * field[ii][i]}%)`
                : `hsl(from ${bgColor} h s l)`;
            ctx.fillRect(ii * pixelSize, i * pixelSize, pixelSize, pixelSize);
        }
    }
    icon.href = canvas.toDataURL();
    return diff;
}
function generateEmptyField() {
    let field = Array(dims);
    for (let i = 0; i < dims; i++) {
        field[i] = Array(dims).fill(0);
    }
    return field;
}
async function digestSeedString(message) {
    if (!window.crypto) {
        /// bruh, are you a dinosaur?
        console.error(
            "window.crypto doesn't exist, use a modern browser ya dingus!",
        );
        return undefined; /// make sure everything breaks too
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await window.crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    return parseInt(
        "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join(""),
    ); // convert bytes to hex string
}
/// https://stackoverflow.com/a/47593316
/// math! i dont understand it
function splitmix32(a) {
    return function () {
        a |= 0;
        a = (a + 0x9e3779b9) | 0;
        let t = a ^ (a >>> 16);
        t = Math.imul(t, 0x21f0aaad);
        t = t ^ (t >>> 15);
        t = Math.imul(t, 0x735a2d97);
        return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
    };
}
async function seedField(seed, field) {
    const rng = splitmix32(await digestSeedString(seed));

    let occupiedPixes = {};
    let TOTAL_PIX = dims * dims;
    for (let i = 0; i < 5; i++) {
        let s = randPos(rng, TOTAL_PIX);
        let x = s % dims;
        console.log("seed at", s);
        occupiedPixes[s] = true;
        field[x][(s - x) / dims] = 1;
    }

    let max = Math.round(TOTAL_PIX * dlaStopThresh);
    let pos = 0;
    let i = 0;
    let iters = 0;
    console.log("starting dla");
    const inter = setInterval(() => {
        let newPos = dla(rng, pos, field, occupiedPixes);
        iters++;
        if (newPos == -1) {
            pos = 0;
            i++;
        } else if (iters >= 300) {
            iters = 0;
            pos = randPos(rng, TOTAL_PIX);
        } else {
            pos = newPos;
        }
        if (i == max) {
            console.log("starting cgol");
            clearInterval(inter);
            /// start cgol and keep going until we stabilize
            /// lower thresh = less alive at the end
            const minUpdates = Math.ceil(dims * dims * cgolStopThresh);
            const cgolinter = setInterval(() => {
                [oldfield, field] = [field, cgol(field)];
                if (drawField(oldfield, field) <= minUpdates) {
                    clearInterval(cgolinter);
                }
            }, tickMS);
        }
    }, 10);
    return field;
}
function randPos(rng, maxPos) {
    return Math.round(rng() * maxPos);
}

function dla(rng, prevPos, field, occupiedPixes) {
    let TOTAL_PIX = dims * dims;
    let SIZE = dims;
    let pos = prevPos;
    /// small optimization: move either -1, 0, or 1
    // let newX = (randPos(rng, 69)%3) - 1;
    // let newY = (randPos(rng, 69)%3) - 1;
    // /// we wanna actually mewwwwvuhhhh
    // while (newX == 0 && newY == 0) {
    //     newX = (randPos(rng, 69)%3) - 1;
    //     newY = (randPos(rng, 69)%3) - 1;
    // }
    // let targetPos = pos + newY * SIZE + newX;

    let dir = randPos(rng, 64) % 4;
    let targetPos;
    /// this is a lot more interesting of a dla
    switch (dir) {
        case 0: {
            targetPos = pos + SIZE;
            break;
        }
        case 1: {
            targetPos = pos + 1;
            break;
        }
        case 2: {
            targetPos = pos - SIZE;
            break;
        }
        case 3: {
            targetPos = pos - 1;
            break;
        }
    }

    if (targetPos < 0) {
        // targetPos = randPos(rng, TOTAL_PIX);
        targetPos += TOTAL_PIX;
    } else if (targetPos > TOTAL_PIX) {
        targetPos -= TOTAL_PIX;
    }
    let x = pos % SIZE;
    let y = (pos - x) / SIZE;
    if (occupiedPixes[targetPos]) {
        /// we hit something! stop
        occupiedPixes[pos] = true;
        field[x][y] = 1;
        targetPos = -1;
    } else {
        /// draw the current position
        field[x][y] = 1;
        drawField(field, field);
        field[x][y] = 0;
    }
    return targetPos;
}

const params = new URLSearchParams(window.location.search);
const dims = 16; /// any bigger and it takes too long to execute
const cgolStopThresh = 0.25;
const dlaStopThresh = 0.53;
const pixelSize = 16;
const tickMS = parseInt(params.get("cgoltickspeed")) || 300;

const icon = document.querySelector('link[rel="icon"]');
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
let bgColor, fgColor;
canvas.width = dims * pixelSize;
canvas.height = dims * pixelSize;
const contdiv = document.createElement("div");

/// not tracking you i swear, this is for seeding the game
/// if you havent seen already, look in the favicon
/// most visitors get a unique favicon :3
const seedstring =
    `${navigator.userAgent}${navigator.hardwareConcurrency}${navigator.maxTouchPoints}` +
    `${window.devicePixelRatio}${navigator.language}` +
    `${new Date().getTimezoneOffset()}${navigator.buildID}${location.hostname}` +
    `${navigator.oscpu}`;

window.addEventListener("load", () => {
    const computedStyle = getComputedStyle(document.documentElement);
    bgColor = computedStyle.getPropertyValue("--background-color");
    fgColor = computedStyle.getPropertyValue("--text-color");

    seedField(seedstring, generateEmptyField(dims));
});
