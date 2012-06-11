Wildcat is a simple, fast CSS matching engine, weighing in at only 5kb uncompressed and 1kb minified and gzipped.

    Wildcat.match(DOMElement, selector)

`selector` is a small subset of CSS3 selectors:
    - Node name: `div`
    - Universal selector: `*`
    - ID selector: `#id`
    - Class selector: `.class`
    - Decendant selector: `div p`
    - Attribute selector (=, !=): `input[type=text]`
    - Pseudoclasses (:not): `p:not(.example)`
    - Comma selector: `div, p, a`
    - Any combination of the above: `#id .class:not([type=text]) p.example`

Only the = and != attribute selectors are supported, and only the :not pseudoclass. Fortunately, Wildcat is extensible, so if you need more than that, you can implement it without much hassle.

Wildcat is blazing fast, often faster than the browser's native matchesSelector implementation (though recent versions of WebKit tend to beat it). It achieves this by compiling selectors to efficient JavaScript functions.
