(function (window, undefined) {

function Wildcat(elem, selector) {
    return Wildcat.compile(selector)(elem);
}

var old = window.Wildcat, cache = Wildcat.cache = [];
Wildcat.cacheSize = 50;

function isIdent(c) {
    return c > '/' && c < ':' || // 0-9
          (c > '@' && c < '[') || // A-Z
          (c > '`' && c < '{') || // a-z
          c == '-' || c == '_';
}

Wildcat.tokenize = function (selector) {
    for (var chars = selector.split(''), tokens = [], i = 0, c, acc, q, ident, special = {
        '[': 1, ']': 1, '(': 1, ')': 1, '"': 3, "'": 3, ' ': 2
    }; c = chars[i++];) {
        if (special[c] == 3) {
            for (acc = '', q = c; (c = chars[i++]) && c != q;)
                acc += c;
            tokens.push({type: 1, value: acc});
        }
        else if (special[c] == 1)
            tokens.push({type: 2, value: c});
        else if (c == ' ' && chars[i] != ' ' && (isIdent(chars[i - 2]) || special[chars[i - 2]]))
            tokens.push({type: 2, value: c});
        else {
            for (ident = isIdent(c), acc = '', --i; (c = chars[i++]) && (ident ? isIdent(c) : !isIdent(c) && !special[c]);)
                acc += c;
            if (acc) {
                c = chars[--i];
                tokens.push({type: ident ? 1 : 2, value: acc});
            }
        }
    }
    return tokens;
};

Wildcat.i = function (array, obj) {
    if ([].indexOf)
        return [].indexOf.call(array, obj);
    for (var i = 0, l = array.length; i < l; ++i) {
        if (array[i] === obj)
            return i;
    }
    return -1;
};

Wildcat.fix = {'class': 'className', 'for': 'htmlFor'};

Wildcat.g = function (elem, attr) {
    if (Wildcat.fix[attr])
        return elem[Wildcat.fix[attr]];
    return elem.getAttribute(attr);
};

function compileToken(token, i, tokens, func) {
    return Wildcat.compiled[token.type == 1 ? 1 : token.value](token.value, tokens[i[0]++], i, tokens, func);
}

Wildcat.compiled = {
    1: function (value, _, i) {
        --i[0];
        return 'e.tagName.toUpperCase()=="' + value.toUpperCase() + '"';
    },
    '*': function () { return '!0'; },
    '#': function (_, next, i) { return 'e.id=="' + next.value + '"'; },
    '.': function (_, next, i) { return 'W.i(e.className.split(" "),"' + next.value + '")>-1'; },
    ' ': function (_, next, i, tokens, func) {
        return {
            prefix: compileToken(next, i, tokens, func) + '&&(function(e){while((e=e.parentNode)&&e.tagName)if(',
            suffix: ')return!0;return!1})(e)'
        };
    },
    '[': function (_, next, i, tokens) {
       return 'W.g(e,"' + next.value + '")' + (!tokens[++i[0] + 1] || tokens[i[0] + 1].value != ']' ?
       '!=null' : Wildcat.compiled[tokens[i[0] - 1].value](tokens[(i[0] += 2) - 2].value));
    },
    '=': function (value) { return '=="' + value + '"'; },
    '!=': function (value) { return '!="' + value + '"'; },
    ':': function (_, next, i, tokens) {
        for (var toks = [], tok, balance = 1; tok = tokens[++i[0]]; balance += tok.value == '(' ? 1 : 0) {
            if (tok.value == ')' && !--balance) {
                ++i[0];
                break;
            }
            toks.push(tok);
        }
        return Wildcat.pseudos[next.value](toks);
    },
    ',': function (_1, _2, i, tokens) {
        i[1] = i[0];
        i[0] = tokens.length;
        return {
            prefix: '(',
            suffix: ')||(' + Wildcat.compile(tokens.slice(i[1] - 1), true) + ')'
        };
    }
};

Wildcat.pseudos = {
    'not': function (tokens) { return '!(' + Wildcat.compile(tokens, true) + ')'; }
};

Wildcat.compile = function (selector, noFn) {
    if (!noFn && cache[selector])
        return cache[selector];
    for (var tokens = noFn ? selector : Wildcat.tokenize(selector), token, func = [noFn ? '' : 'return '],
    fn = function (elem) { return func(elem, Wildcat); }, i = [0]; token = tokens[i[0]++];) {
        func[0] += i[0] > 1 ? '&&' : '';
        if (typeof (func[1] = compileToken(token, i, tokens, func)) == 'object') {
            func[0] = (noFn ? '' : 'return ') + func[1].prefix + func[0].substr(noFn ? 0 : 6, func[0].length - (noFn ? 2 : 8));
            func[1] = func[1].suffix;
        }
        func[0] += func[1];
    }
    if (!noFn) {
        func = Function('e,W', func[0]);
        cache.push(selector);
        ache[selector] = fn;
        if (cache.length > Wildcat.cacheSize)
            delete cache[cache.shift()];
    }
    return noFn ? func[0] : fn;
};

Wildcat.noConflict = function () {
    window.Wildcat = old;
    return Wildcat;
};

window.Wildcat = Wildcat;

})(this);
