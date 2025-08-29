const pane = document.getElementById('pane')
const panecmd = document.getElementById('panecmd')
const menu = document.getElementById('menu')
let activePane = 'loading'
/**
 *
 * @param {MouseEvent|KeyboardEvent} ev
 */
const menuAction = (ev) => {
    const box = document.getElementById('dropdownlow')
    const elm = ev.target
    const section = elm.attributes.page?.value

    if (ev?.key) {
        if (ev.key === 'ArrowUp') {
            ev.preventDefault()
            if (elm.previousElementSibling) {
                elm.previousElementSibling.focus()
            } else {
                elm.parentElement.lastElementChild.focus()
            }
            return
        }
        if (ev.key === 'ArrowDown') {
            ev.preventDefault()
            if (elm.nextElementSibling) {
                elm.nextElementSibling.focus()
            } else {
                elm.parentElement.firstElementChild.focus()
            }
            return
        }

        // unfocus
        if (ev.key === 'Escape') {
            ev.preventDefault()
            elm.blur()
            return
        }
        // ignore everything else
        if (!['ArrowRight', 'Enter'].includes(ev.key)) {
            return
        }
    }

    if (!section) {
        return
    }
    if (activePane) {
        document.getElementById(activePane).className = 'hidden'
    }
    document.getElementById(section).className = ''
    activePane = section
    panecmd.innerText = section
    box.checked ? (box.checked = false) : null
}
const paneAction = (ev) => {
    if (ev?.key) {
        if (ev.key === 'ArrowLeft') {
            ev.preventDefault()
            console.log(ev)
            menu.firstElementChild.focus()
            return
        }
    }
}

function activateMenu() {
    const links = document.getElementsByClassName('menu-link')

    // apply input listener
    for (const link of links) {
        link.onclick = menuAction
        link.onkeydown = menuAction
    }
    pane.onkeydown = paneAction
    // load default panel
    menuAction({ target: { attributes: { page: { value: 'aboutme' } } } })
    links[0].focus()
}

/// ok now do the thing
try {
    activateMenu()
    /// xxd -r -p | xxd -l 256
    /// 000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
    console.log(`
        0100 0000 0000 0000 0000 0000 0000 0000  ................
        0000 0000 0000 0000 0000 0000 0000 0000  ................
        0000 0000 3ba3 edfd 7a7b 12b2 7ac7 2c3e  ....;...z{..z.,>
        6776 8f61 7fc8 1bc3 888a 5132 3a9f b8aa  gv.a......Q2:...
        4b1e 5e4a 29ab 5f49 ffff 001d 1dac 2b7c  K.^J)._I......+|
        0101 0000 0001 0000 0000 0000 0000 0000  ................
        0000 0000 0000 0000 0000 0000 0000 0000  ................
        0000 0000 0000 ffff ffff 4d04 ffff 001d  ..........M.....
        0104 4554 6865 2054 696d 6573 2030 332f  ..EThe Times 03/
        4a61 6e2f 3230 3039 2043 6861 6e63 656c  Jan/2009 Chancel
        6c6f 7220 6f6e 2062 7269 6e6b 206f 6620  lor on brink of
        7365 636f 6e64 2062 6169 6c6f 7574 2066  second bailout f
        6f72 2062 616e 6b73 ffff ffff 0100 f205  or banks........
        2a01 0000 0043 4104 678a fdb0 fe55 4827  *....CA.g....UH'
        1967 f1a6 7130 b710 5cd6 a828 e039 09a6  .g..q0..\..(.9..
        7962 e0ea 1f61 deb6 49f6 bc3f 4cef 38c4  yb...a..I..?L.8.
    `)
    /// 0000000000000000000d656be18bb095db1b23bd797266b0ac3ba720b1962b1e
    console.log(`
        00e0 ff27 9ba7 2c6a 3f1e 81e6 2004 f991  ...'..,j?... ...
        dc12 b5af 3d97 58c1 8406 0300 0000 0000  ....=.X.........
        0000 0000 0f3a 570c 00a2 9620 ed50 17e1  .....:W.... .P..
        225e ffa1 a4be 5c47 f549 abd8 4200 cb55  "^....\G.I..B..U
        3d11 75f4 2ba6 b95e 397a 1117 cf8d fb83  =.u.+..^9z......
        fdb1 0901 0000 0000 0101 0000 0000 0000  ................
        0000 0000 0000 0000 0000 0000 0000 0000  ................
        0000 0000 0000 0000 0000 ffff ffff 6403  ..............d.
        ef9c 0952 f09f 909f 4e59 5469 6d65 7320  ...R....NYTimes
        3039 2f41 7072 2f32 3032 3020 5769 7468  09/Apr/2020 With
        2024 322e 3354 2049 6e6a 6563 7469 6f6e   $2.3T Injection
        2c20 4665 6427 7320 506c 616e 2046 6172  , Fed's Plan Far
        2045 7863 6565 6473 2032 3030 3820 5265   Exceeds 2008 Re
        7363 7565 2020 144d 696e 6564 2005 00ba  scue  .Mined ...
        5e48 0000 0000 0004 6d4a e050 0000 0000  ^H......mJ.P....
        1976 a914 c825 a1ec f2a6 830c 4401 620c  .v...%......D.b.
    `)
    /// 000000000000000000003b1e8108e0d85ad0f698ded94360b27e0ca766682b4f
    console.log(`
        0000 0020 c95b 887f e72e 7a4e de37 66db  ... .[....zN.7f.
        a9f3 86db 543e ab0a fbdf 0b00 0000 0000  ....T>..........
        0000 0000 69ab 8a32 1b4d 484a a6ff b41b  ....i..2.MHJ....
        70e9 df01 7661 6cdf a81f 0e55 b0c0 d59b  p...val....U....
        3f3f 49ce 94f6 7660 482a 0c17 67c1 cd10  ??I...v\`H*..g...
        fd4f 0c01 0000 0000 0101 0000 0000 0000  .O..............
        0000 0000 0000 0000 0000 0000 0000 0000  ................
        0000 0000 0000 0000 0000 ffff ffff 6403  ..............d.
        135d 0a54 4e59 5469 6d65 7320 3130 2f4d  .].TNYTimes 10/M
        6172 2f32 3032 3120 486f 7573 6520 4769  ar/2021 House Gi
        7665 7320 4669 6e61 6c20 4170 7072 6f76  ves Final Approv
        616c 2074 6f20 4269 6465 6e27 7320 2431  al to Biden's $1
        2e39 5420 5061 6e64 656d 6963 2052 656c  .9T Pandemic Rel
        6965 6620 4269 6c6c 104d 696e 6505 0082  ief Bill.Mine...
        3537 6066 7116 0004 e352 352d 0000 0000  57\`fq....R5-....
        1976 a914 c825 a1ec f2a6 830c 4401 620c  .v...%......D.b.
    `)
    /// pogolo!
    console.log(`
        0000 0030 95ed e48e ab98 ff50 d899 03f3  ...0.......P....
        56c8 695e 2454 7434 f704 fa78 4629 4557  V.i^$Tt4...xF)EW
        3af0 1319 940c b750 da3b 8a7a 1649 0cba  :......P.;.z.I..
        e82a 45c7 0a03 811f e2e4 7123 1bab 5514  .*E.......q#..U.
        1fca 81a1 46f2 8368 ffff 7f20 bc3f 2ceb  ....F..h... .?,.
        0101 0000 0001 0000 0000 0000 0000 0000  ................
        0000 0000 0000 0000 0000 0000 0000 0000  ................
        0000 0000 0000 ffff ffff 2602 9700 1a2f  ..........&..../
        706f 676f 6c6f 202d 2066 6f73 7320 6973  pogolo - foss is
        2066 7265 6564 6f6d 2f93 5912 1200 0000   freedom/.Y.....
        00ff ffff ff02 00f9 0295 0000 0000 1600  ................
        1462 9cf9 5ea5 2e94 9c3c 0ed4 7a0f bb41  .b..^....<..z..A
        a6bc 0b19 4d00 0000 0000 0000 0026 6a24  ....M........&j$
        aa21 a9ed e2f6 1c3f 71d1 defd 3fa9 99df  .!.....?q...?...
    `)
    /// pogolo with the new tag
    console.log(`
        0000 0030 a98c 19ef 87c0 4a64 1d4e b335  ...0......Jd.N.5
        384b dd11 9822 89a3 db81 fd95 9f0a 8961  8K...".........a
        0100 0000 0a1a bc79 4b63 72b6 4487 f08b  .......yKcr.D...
        4b13 98c7 7e3f 1dc3 7c7d 1f37 17a2 ae45  K...~?..|}.7...E
        7dd7 3557 f6be b068 ffff 7f20 cdb9 6e54  }.5W...h... ..nT
        0101 0000 0000 0101 0000 0000 0000 0000  ................
        0000 0000 0000 0000 0000 0000 0000 0000  ................
        0000 0000 0000 0000 ffff ffff 2b02 3501  ............+.5.
        1e2f 706f 676f 6c6f 202d 2064 6563 656e  ./pogolo - decen
        7472 616c 697a 6520 6f72 2064 6965 2f08  tralize or die/.
        6f66 b46a 0000 0000 ffff ffff 0200 0000  of.j............
        0000 0000 0026 6a24 aa21 a9ed e2f6 1c3f  .....&j$.!.....?
        71d1 defd 3fa9 99df a369 5375 5c69 0689  q...?....iSu\i..
        7999 62b4 8beb d836 974e 8cf9 807c 814a  y.b....6.N...|.J
        0000 0000 1600 1462 9cf9 5ea5 2e94 9c3c  .......b..^....<
        0ed4 7a0f bb41 a6bc 0b19 4d01 2000 0000  ..z..A....M. ...
    `)
} catch (e) {
    pane.innerText = errorCleaner(e)
}
