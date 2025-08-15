package main

import (
	"fmt"
	"image"
	"os"
	"os/user"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"sync"

	"github.com/aymerick/raymond"
	"github.com/bbrks/go-blurhash"
	"github.com/kovidgoyal/imaging"
	"github.com/tdewolff/minify/v2"
	"github.com/tdewolff/minify/v2/html"
	"gopkg.in/yaml.v3"
)

const (
	ourIPNS        = "ipns://k51qzi5uqu5dj1i56kb5hursj0qmfl4mc9ri82i827tuh0ap6dmpyckmlg0sws"
	pawprint       = "36A5 ECBE 51A7 FFD2 DC82 7FE6 C8BB 0195 E47B 7CD6"
	layoutFileName = "layout.handlebars"
)

var (
	DRY_RUN = os.Getenv("DRY_RUN") != ""
	DEV     = os.Getenv("DEV") != ""
	cwd     = func() string {
		s, _ := os.Getwd()
		return s
	}()
	siteDir     = filepath.Join(cwd, "site/")
	viewsDir    = filepath.Join(siteDir, "src/views/")
	LAYOUT_FILE = func() string {
		d, _ := os.ReadFile(filepath.Join(viewsDir, layoutFileName))
		return string(d)
	}()
	LAYOUT      = raymond.MustParse(LAYOUT_FILE)
	DEFAULT_CTX = map[string]interface{}{
		"themecolor": "#262638",
		"author":     "0xf0xx0",
		"ipns":       ourIPNS,
		"DEV":        DEV,
	}
	frontmatterRegex = regexp.MustCompile(`^---\n([\s\S]+)---\n([\s\S]+)$`)
)

type Page = struct {
	name    string
	content string
}

func main() {
	registerHelpers()

	views, _ := os.ReadDir(viewsDir)
	views = slices.DeleteFunc(views, func(s os.DirEntry) bool {
		name := s.Name()
		if filepath.Ext(name) != ".handlebars" || name == layoutFileName || strings.HasPrefix(name, ".") {
			return true
		}
		return false
	})

	minifier := minify.New()
	minifier.AddFunc("text/html", html.Minify)
	waiter := sync.WaitGroup{}
	for _, view := range views {
		waiter.Add(1)
		go func() {
			defer waiter.Done()
			println("compiling", view.Name())
			page := compileToHTML(view.Name())
			// minified := []byte(page.content)
			minified, _ := minifier.Bytes("text/html", []byte(page.content))
			if !DRY_RUN {
				os.WriteFile(filepath.Join(siteDir, page.name+".html"), minified, 755)
			}
			println("compiled", view.Name())
		}()
	}
	waiter.Wait()
}

/// helpers

func registerHelpers() {
	/// no variadic args?
	raymond.RegisterHelper("concat", func(a, b string) raymond.SafeString {
		return raymond.SafeString(a+b)
	})
	raymond.RegisterHelper("script", func(url string) raymond.SafeString {
		return raymond.SafeString(`<script defer src='`+url+"'></script>")
	})
	raymond.RegisterHelper("wrappedlink", wrappedLinkHelper)
	raymond.RegisterHelper("populategallery", func(options *raymond.Options) raymond.SafeString {
		page := options.ValueStr("page")
		gallery := galleries[page]
		galleryHtml := strings.Builder{}
		galleryHtml.Grow(15_360) /// a little less than we need

		/// TODO: refactor?
		imageHTML := make([]string, len(gallery.images))
		waiter := sync.WaitGroup{}
		for idx, img := range gallery.images {
			waiter.Add(1)
			go func() {
				defer waiter.Done()
				file, err := os.Open(resolvePath("site/src/views/shrunk" + img.url))
				if err != nil {
					println(fmt.Sprintf("Input could not be opened: %s", err))
					os.Exit(1)
				}
				defer file.Close()

				rawImg, _, err := image.Decode(file)
				if err != nil {
					println(fmt.Sprintf("Input could not be decoded: %s", err))
					os.Exit(1)
				}
				w := rawImg.Bounds().Dx()
				h := rawImg.Bounds().Dy()
				sw, sh := scaleDown(w, h)
				println(`blurhashing ` + img.url + "...")
				hash, _ := blurhash.Encode(3, 4, imaging.Resize(rawImg, sw, sh, imaging.BSpline))
				blurred := fmt.Sprintf("%s %d,%d", hash, sw, sh)

				/// use the image path without the file ext as the id
				divID := strings.Split(img.url, ".")[0]
				fullURL := gallery.path + img.url
				if DEV {
					fullURL = gallery.devPath + img.url
				}
				source := "&#xe007;source unknown&#xe008;"
				license := ""
				if img.sourceURL != "" {
					if img.credits == "" {
						img.credits = "source"
					}
					source = string(wrappedLinkHelper(img.credits, img.sourceURL))
				}
				if img.licenseURL != "" {
					if img.license == "" {
						img.license = "license"
					}
					license = string(wrappedLinkHelper(img.license, img.licenseURL))
				}

				imageHTML[idx] = fmt.Sprintf(`<div class="img-container" id="%s"><a href="%s"><img src="" blurhash="%s" source="%s" width="%d" height="%d" loading="lazy" /></a>`, divID, fullURL, blurred, fullURL, w, h)
				if img.desc != "" || source != "" || license != "" {
					imageHTML[idx] += `<p class="img-desc">`
					/// i dont *need* to do this double-shitstack, but i wanna
					/// minimize useless whitespace
					if img.desc != "" {
						imageHTML[idx] += img.desc + " "
					}
					if source != "" {
						imageHTML[idx] += source + " "
					}
					imageHTML[idx] += license
					imageHTML[idx] += `</p>`
				}
				imageHTML[idx] += "</div>"
			}()
		}
		waiter.Wait()
		for _, html := range imageHTML {
			galleryHtml.WriteString(html)
		}
		return raymond.SafeString(galleryHtml.String())
	})
	raymond.RegisterHelper("hyperlink", func(text, url string) raymond.SafeString {
		target := ""
		if url != ourIPNS && strings.HasPrefix(url, "https://") {
			target = `target="_blank"`
		}
		return raymond.SafeString(fmt.Sprintf(`<a href="%s" %s>[ %s ]</a>`, url, target, text))
	})
	raymond.RegisterHelper("header", func(maintext, subtext string, options *raymond.Options) raymond.SafeString {
		if subtext != "" {
			subtext = strings.ReplaceAll(subtext, "\\n", "<br />")
		}
		maintext = strings.ReplaceAll(maintext, "\\n", "<br />")
		return raymond.SafeString(`<div id='header'><div><h1>` +
			raymond.MustRender(maintext, options.Ctx()) +
			`</h1><h2>` +
			raymond.MustRender(subtext, options.Ctx()) +
			`</h2></div><hr /></div>`)
	})
	raymond.RegisterHelper("footer", func(options *raymond.Options) raymond.SafeString {
		return raymond.SafeString(`<footer><hr/>` + options.Fn() + `</footer>`)
	})
	raymond.RegisterHelper("svg", func(path string) raymond.SafeString {
		svg, _ := os.ReadFile(filepath.Join(cwd, "/site/", path))
		return raymond.SafeString(`<div class="svgcont">` + string(svg) + `</div>`)
	})
	raymond.RegisterHelper("pawprint", func() raymond.SafeString {
		split := strings.Split(pawprint, " ")
		ret := ""
		for i, s := range split {
			ret += `<span>` + s + `</span> `
			if (i+1)%5 == 0 {
				ret += "<br />"
			}
		}
		return raymond.SafeString(ret)
	})
	raymond.RegisterHelper("cursorblink", func() raymond.SafeString {
		return raymond.SafeString("<span class='cursor-blink'>&#xe006;</span>")
	})
}

func compileToHTML(page string) Page {
	file, _ := os.ReadFile(filepath.Join(viewsDir, page))
	fileName := strings.Split(page, ".")[0]

	matches := frontmatterRegex.FindSubmatch(file)
	metadata := make(map[string]interface{}) //frontmatter{}
	yaml.Unmarshal(matches[1], &metadata)
	body := raymond.MustParse(string(matches[2]))

	extra := mergeCtxs(copyDefaultCtx(nil), metadata)
	extra["page"] = fileName
	if fileName == "index" {
		extra["path"] = ""
	} else {
		extra["path"] = fileName + ".html"
	}
	stylesheets := ""
	if metadata["stylesheets"] != nil {
		for _, sheet := range metadata["stylesheets"].([]interface{}) {
			stylesheets += `<link rel="stylesheet" type="text/css" href="src/styles/` +
				sheet.(string) +
				`.css"/>`
		}
	}
	keywords := []string{
		"⎇",
		"ΘΔ",
		"alterbeing",
		"theriomythic",
		"nonhuman",
		"0xf0xx0",
		"ens",
		"web3",
		"true web3",
		"assegai",
		"cypherpunk",
	}
	if _, ok := metadata["keywords"]; ok {
		for _, k := range metadata["keywords"].([]interface{}) {
			keywords = append(keywords, k.(string))
		}
	}
	extra["stylesheets"] = stylesheets
	extra["keywords"] = strings.Join(keywords, ", ")

	pageCtx := copyDefaultCtx(extra)
	pageCtx["body"] = body.MustExec(extra)
	return Page{
		name:    extra["page"].(string),
		content: LAYOUT.MustExec(pageCtx),
	}
}

func resolvePath(path string) string {
	if strings.HasPrefix(path, "~") {
		// Use strings.HasPrefix so we don't match paths like
		// "/something/~/something/"
		usr, _ := user.Current()
		home := usr.HomeDir
		path = filepath.Join(home, path[1:])
	}
	return path
}

func wrappedLinkHelper(text, url string) raymond.SafeString {
	target := ""
	if url != ourIPNS && strings.HasPrefix(url, "https://") {
		target = `target="_blank"`
	}

	return raymond.SafeString(fmt.Sprintf(`&#xe007;<a href="%s" %s>%s</a>&#xe008;`, url, target, text))
}
func scaleDown(x, y int) (int, int) {
	divisor := float64(max(x, y)) / 32

	return int(float64(x) / divisor), int(float64(y) / divisor)
}
func copyDefaultCtx(ctx map[string]interface{}) map[string]interface{} {
	newMap := make(map[string]interface{})
	if ctx == nil {
		ctx = DEFAULT_CTX
	}
	for k, v := range ctx {
		newMap[k] = v
	}
	return newMap
}

// / b -> a
func mergeCtxs(a, b map[string]interface{}) map[string]interface{} {
	for k, v := range b {
		a[k] = v
	}
	return a
}
