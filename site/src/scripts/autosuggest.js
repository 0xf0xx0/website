class Autosuggest {
    #inputElm = null
    #completionElm = null

    #suggestions = []
    #lastSuggestion = ''

    constructor(inputElm, completionElm, suggestions) {
        this.#inputElm = inputElm
        this.#completionElm = completionElm
        this.#suggestions = suggestions
        this.#inputElm.addEventListener('keydown', (ev) => this.#keyDown(ev))
        this.#inputElm.addEventListener('keyup', (ev) => this.#onInput(ev))
    }
    #onInput(ev) {
        ev.preventDefault()

        if (
            !ev.key.match(/^[\w\d `~!@#$%^&*\(\)_\-+=\{\}\[\]|\/,.:;"']$/) &&
            //                   ^ if the key isnt a actual character
            !ev.key.match(/(Backspace|Delete)/i)
        ) {
            return
        }

        // ignore select/copy/paste
        if (ev.key.match(/^(a|c|v)$/) && ev.ctrlKey) {
            return
        }
        // ignore only meta presses
        if (ev.key.match(/(Control|Shift|Alt|OS)/i)) {
            return
        }

        const cleanedInput = this.#inputElm.innerText.replace(/(\n|\r|\t)/gi, '')
        if (cleanedInput === '') {
            this.#lastSuggestion = ''
            this.#completionElm.innerText = ''
            return
        }
        const { input, suggestions } = this.#suggest(cleanedInput)

        if (suggestions.length > 0) {
            this.#completionElm.innerText = `${suggestions[0].replace(input, '')}`
            this.#lastSuggestion = suggestions[0]
        } else {
            this.#completionElm.innerText = '' // clear
        }
        // call cleanup method
        this.#afterInput(ev)
    }
    #keyDown(ev) {
        // quickly ignore events before further processing
        if (ev.key.match(/(Control|Shift|Alt|OS)/i)) {
            return
        }
        if (ev.key === 'ArrowRight' && this.#getCaretPosition() >= this.#inputElm.innerText.length - 1) {
            // apparently the caret can decide to exit the input element... this keeps it in line
            this.#positionCaret(this.#inputElm.innerText.length)
            ev.preventDefault()
            //return
        }
        if (ev.key === 'a' && ev.ctrlKey) {
            ev.preventDefault()
            return // no selecting here baby
        }

        if (ev.key === 'Enter') {
            ev.preventDefault()
            return
        }

        if (ev.key === 'Tab' || ev.key === 'ArrowRight') {
            // tab and arrow completion
            ev.preventDefault()
            const completedText = `${this.#inputElm.innerText}${this.#completionElm.innerText}`
            this.#completionElm.innerText = '' // its done
            this.#inputElm.innerText = completedText
            this.#lastSuggestion = '' // clear suggestion
            this.#positionCaret() // and move the cursor to the end
            return
        }
    }
    #afterInput(ev) {
        // remove <br> that ff inserts
        for (const node of this.#inputElm.childNodes) {
            if (node && node.tagName == 'BR') {
                node.remove()
            }
        }

        // WANTED: command coloring
    }
    #suggest(text) {
        let userInput = text
        if (text === this.#lastSuggestion) {
            userInput = text.replace(this.#lastSuggestion, '')
        }
        if (userInput === '') {
            return {
                input: userInput,
                suggestions: [],
            }
        }
        return {
            input: userInput,
            suggestions: this.#suggestions.filter((v) => v === userInput || v.startsWith(userInput)),
        }
    }
    // from https://www.geeksforgeeks.org/how-to-set-cursor-position-in-content-editable-element-using-javascript/
    #positionCaret(pos) {
        const tag = this.#inputElm

        if (!tag.childNodes || !tag.childNodes[0]) {
            return
        }
        if (!pos) {
            pos = tag.childNodes[0].length
        }

        const setpos = document.createRange()
        const set = window.getSelection()

        try {
            setpos.setStart(tag.childNodes[0], pos)
        } catch (e) {
            console.error(e)
            setpos.setStart(tag.childNodes[0], tag.childNodes[0].length)
        }
        setpos.collapse(true)
        set.removeAllRanges()
        set.addRange(setpos)
        tag.focus()
    }
    // https://stackoverflow.com/a/46902361
    // gotta love js lol, this is so slow
    #getCaretPosition() {
        const range = window.getSelection().getRangeAt(0)
        const preCaretRange = range.cloneRange()

        preCaretRange.selectNodeContents(this.#inputElm)
        preCaretRange.setEnd(range.endContainer, range.endOffset)
        return preCaretRange.toString.length
    }
    // https://stackoverflow.com/a/32809957
    stop() {
        this.#inputElm.outerHTML = this.#inputElm.outerHTML
        this.#completionElm.remove()
    }
}
