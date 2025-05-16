import { decodeBlurHash } from './fast-blurhash.js'
/**
 * @param {string} src
 * @param {HTMLImageElement} origImgElm
 */
function placeholder(src, origImgElm) {
    origImgElm.addEventListener(
        'load',
        (ev) => {
            const img = new Image()
            img.src = src
            /// i dont like this but it fixes the issue
            /// https://stackoverflow.com/questions/65146920/domexception-invalid-image-request
            img.addEventListener("load", () => {
                img.decode().then(() => {
                    origImgElm.src = src
                })
            })
        },
        { once: true }
    )

    const [blurhashed, dims] = origImgElm.getAttribute('blurhash').split(' ')
    let [w, h] = dims.split(',')
    w = parseInt(w)
    h = parseInt(h)
    const pixels = decodeBlurHash(blurhashed, w, h)

    blurhashcanvas.width = w
    blurhashcanvas.height = h

    const blurhashimageData = blurhashctx.createImageData(w,h)
    blurhashimageData.data.set(pixels)
    blurhashctx.putImageData(blurhashimageData, 0, 0)
    blurhashcanvas.convertToBlob().then((v) => {
        origImgElm.src = URL.createObjectURL(v)
    })
}

const blurhashcanvas = new OffscreenCanvas(0, 0)
const blurhashctx = blurhashcanvas.getContext('2d')
for (const img of document.body.getElementsByTagName('img')) {
    placeholder(img.getAttribute('source'), img)
}
