const pixelsorts = {
    tld: 'https://0xf0xuments.0xf0xx0.eth.limo/pixelsort-gens',
    images: [
        {
            url: '/mutlnomah-falls/seam-60deg.jpg',
            desc: 'mmmmmmm seam sorting,,,,,'
        },
        {
            url: '/mutlnomah-falls/whirl.jpg',
            desc: 'one day i\'ll figure out curved sorts, why are artists so secretive'
        },
        {
            url: '/mutlnomah-falls/sorted.jpg',
            desc: 'perfect pixelsorting pic'
        },
        {
            url: '/nui-malama/seam.jpg',
            desc: 'seam sorting is fun'
        },
        {
            url: '/nui-malama/masked.jpg'
        },
        {
            url: '/nui-malama/fullsort.jpg'
        },
        {
            url: '/volcanid-ridge/volcanid-ridge.jpg'
        },
        {
            url: '/snowcapped-mountain/sorted.jpg'
        },
        {
            url: '/house-in-the-trees/house-in-the-trees.jpg',
            desc:  'sometimes simple is all you need'
        },
        {
            url: '/abandoned-californian-pool/sorted.jpg',
            desc: 'this came out better than expected',
            sourceURL: 'https://blog.dominey.photography/2022/05/18/anatomy-of-an-image-ep1-pool',
        },
        { url: '/therianoise/TheriaNoise.png', desc: '&#xe000;⎇' },
        {
            url: '/bridgeskyline/right-then-down.jpg',
            desc: 'classic pixelsort with the city masked off',
            sourceURL: 'https://www.pexels.com/photo/concrete-bridge-near-buildings-during-golden-hour-1755683',
        },
        { url: '/misc/lakepadden-sorted.png' },
        {
            url: '/misc/vaporwavegarden-sorted.jpg',
            desc: 'i started layering sorts with this pic, i love how the two directions overlap :3',
        },
        { url: '/misc/waterpark-sorted.jpg' },
        {
            url: '/lakesurroundedwithmountain/pexels-eberhardgross-629161-sorted-mashup.jpg',
            desc:
                'one of my favorites so far, overlapping sort thresholds is nice x3' +
                '<br>this one was done with:' +
                '<br>lightness with a threshold of [0.0,0.3],' +
                '<br>wave with a length of 240, by hue, at [0.2,0.6] and 45 degrees,' +
                '<br>reverse wave with a length of 360, by red, at [0.5,0.9] and -45 degrees,' +
                '<br>and a randomsort by saturation at [0.8,1.0].' +
                '<br>sidenote, this guy takes the *best* pics :O',
            sourceURL: 'https://www.pexels.com/photo/lake-surrounded-with-mountain-629161',
        },
        {
            url: '/bridgeskyline/differential-classic.jpg',
            desc: 'classic pixelsort, but with a mask made by a differential edge detect in GIMP',
            sourceURL: 'https://www.pexels.com/photo/concrete-bridge-near-buildings-during-golden-hour-1755683',
        },
        {
            url: '/potm2310a/webb-reflective.jpg',
            desc: 'spiral sorting results in this interesting reflective pattern when you rotate the image...',
            credits: 'ESA/Webb, NASA & CSA, A. Adamo (Stockholm University) and the FEAST JWST team',
            sourceURL: 'https://esawebb.org/images/potm2310a/',
        },
        { url: '/dark-brandon/sorted.jpeg', desc: 'dark brandooooooooooon' },
        {
            url: '/lumn-forest/superpixel.jpg',
            desc: 'another version, this time using GIMPs superpixel filter to generate the mask',
            sourceURL: 'https://www.pexels.com/photo/green-leafed-trees-during-fog-time-167684',
        },
        {
            url: '/lumn-forest/heavy-sort.jpg',
            desc: 'my wallpaper for a little bit, i ended up using this pic a lot to test pixelsort_go :3',
            sourceURL: 'https://www.pexels.com/photo/green-leafed-trees-during-fog-time-167684',
        },
        {
            url: '/dark-brandon/90-deg-spiral-masked.jpeg',
            desc:
                '/uj spiral sorting is cool, even cooler when you rotate the image furst' +
                "<br>/rj dark brandon nooo don't smoke the digital spliff!",
        },
        {
            url: '/sleepysnek/classic.jpg',
            desc: 'friend wanted one of their pics sorted :3',
            credits: 'source private',
        },
        {
            url: '/sleepysnek/classic-2.jpg',
            desc: 'i did a second take with more of the city left intact',
            credits: 'source private',
        },
        {
            url: '/dubai-at-night/sorted.jpg',
            desc:
                'i love shots like these<br>this was a <i>pain</i> to mask, ' +
                'i did so much tweaking to the brightness of the buildings to get the ' +
                'edge detection to pick up on enough edges<br>' +
                'not to mention the manually painting over color bands in the sky ' +
                'to get a solid block of sorted pixels<br>' +
                'worth it tho, looks amazing, makes you do a double-take at furst glance',
            sourceURL: 'https://www.pexels.com/photo/photo-of-buildings-during-nighttime-2603464/',
        },
        {
            url: '/misc/walking.jpg',
            desc: 'i really want more pics like this, walking into the glitch is so cool',
            sourceURL:
                'https://www.pexels.com/photo/man-walking-in-solitude-in-yellow-light-on-a-foggy-night-19096790/',
        },
        {
            url: '/daisys/sorted.jpg',
            desc: 'implemented a pixelsmear, this was a test output after debugging :3',
            sourceURL: 'https://www.pexels.com/photo/a-field-of-white-and-yellow-daisies-25752971/',
        },
        {
            url: '/boat-on-lake/final.jpg',
            desc: 'after implementing my pixelsmear, i wanted to do something a bit fancier :3<br>it looks so good~',
            sourceURL: 'https://www.pexels.com/photo/a-boat-is-in-the-water-near-a-mountain-25749272/',
        },
        {
            url: '/dune/dune-sorted.jpg',
            desc: 'mmmm, angles~',
            sourceURL: 'https://www.pexels.com/photo/a-boat-is-in-the-water-near-a-mountain-25749272/',
        },
        {
            url: '/clouds/clouds.png',
            desc: "friend wanted some pics sorted, here's one of em",
            credits: 'source private',
        },
        {
            url: '/clouds/clouds-smeared.png',
            desc: 'smeared variant',
            credits: 'source private',
        },
    ],
}
const eve = {
    tld: 'https://0xf0xuments.0xf0xx0.eth.limo/eve-screenshots',
    images: [
        { url: '/Docked.png', source: 'myself' },
        { url: '/CataclysmicVariable.png', source: 'myself' },
        { url: '/DrifterHole1.png', source: 'myself' },
        { url: '/SuccubusOnDrifterHole.png', source: 'myself' },
    ],
}
module.exports = {
    pixelsorts,
    eve,
}
