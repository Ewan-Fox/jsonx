/** 
*@author Ewan Fox
*@function turns jsx into framework readable json
*@param {string} value - Jsx to be transformed
**/
function compile(value) {
    const e = value.split("");
    var doing = false;
    var current = "";
    var x = []
    var y = []
    var i;
    e.forEach(function (b) {
        i = b.toString();
        if (doing == true && i != ">" && i != "<") {
            current = current + i;
        } else {
            if (i == "<" && doing == false) {
                doing = true;
                current = current + "<";
            } else if (doing == true && i == ">") {
                doing = false;
                current = current + ">"
                x.push(current)
                current = "";
            } else if (doing == false && i != ">" && i != "<") {
                doing = true;
                current = "" + i;
            } else if (doing == true && i == "<") {
                x.push(current);
                current = "" + i;
            } else {
                console.warn("Invalid JSX");

                return;
            }
        }
    })
    x.forEach(function (b) {
        var io = b;
        var element = false;
        var props = [];
        var end = false;
        var i = "";
        var type = "";
        if (io.indexOf("<") == 0) {
            i = io.replace('<', "").replace(">", "");
            if (i.indexOf("/") != -1) {
                i = i.replace("/", "")
                end = true;
            }
            element = true;
        }
        if (element == true) {
            var ie = i.split(" ");
            var type = ie[0];
            i = i.replace(type, "").replace(" ", "");
            if (i != "") {
                i = i.split(" ");
                i.forEach(function (a) {
                    var prop = a;
                    prop = prop.replace('"', "").replace('"', "");
                    prop = prop.replace("'", "").replace("'", "");
                    var proparr = prop.split("=");
                    prop = { "property": proparr[0], "value": proparr[1] };
                    props.push(prop);


                })
                y.push({ "type": type, "props": props, "end": end, "selfclosing": false })
            } else {
                i = "";
                y.push({ "type": type, "end": end, "selfclosing": false });
            }
        } else {
            y.push({ "text": b });
        }
    })

    i = y;
    var arrlength = Object.keys(i).length - 1;
    var element1start = i[0]
    var element1end = i[arrlength];
    var isstartselfclosing = false;
    if (i.length == 1 & isSelfClosing(i[0].type) == true) {
        var element1props = {}
        if (element1start.props) {
            element1start.props.forEach(function (b) {
                const property = b["property"];
                const value = b["value"];
                element1props[property] = value;
            })
        }
        isstartselfclosing = true;
        final = { "type": element1start.type, "props": element1props }
        return final;
    }
    if (element1start.type != element1end.type & isstartselfclosing == false) {
        throw ("Invalid JSX")
    }
    var element1props = {}
    if (element1start.props) {
        element1start.props.forEach(function (b) {
            const property = b["property"];
            const value = b["value"];
            element1props[property] = value;
        })
    }
    function isSelfClosing(value) {
        value = value.toString().toLowerCase().trim();
        switch (value) {
            case "area": return true;
            case "base": return true;
            case "br": return true;
            case "col": return true;
            case "embed": return true;
            case "hr": return true;
            case "img": return true;
            case "input": return true;
            case "link": return true;
            case "meta": return true;
            case "param": return true;
            case "source": return true;
            case "track": return true;
            case "wbr": return true;
            case "command": return true;
            case "keygen": return true;
            case "menuitem": return true;
            default: {
                return false;
            }
        }
    }
    var compiled = { "type": element1start.type, "props": element1props }
    var starts = []
    var ends = []
    var index = 0;
    var text = []
    var elements = []
    var startsindex = 0;
    var endsindex = 0;
    var deepest = 0;
    i.forEach(function (b) {
        if (b.end == false) {
            b.index = index;
            var submersion = startsindex - endsindex;
            if (submersion > deepest) {
                deepest = submersion;
            }
            b.submersion = submersion;
            starts.push(b)
            index++;
            startsindex++;
        } else if (b.end == true) {
            b.index = index;
            ends.push(b);
            index++;
            endsindex++
        } else {
            b.index = index;
            text.push(b)
            index++
        }
    })
    var selfclosing = [];
    function FindEnd(k, first) {
        var matching = []
        starts.forEach(b => {
            if (b.submersion == k) {
                matching.push(b);
            }
        })
        matching.forEach(b => {
            var elementtype = b.type;
            if (isSelfClosing(elementtype) == true) {
                selfclosing.push(b);
                return;
            }
            var candidates = [];
            var j = 0;
            var closest;
            ends.forEach(function (d) {
                if (d.type == elementtype) {
                    if (d.index > b.index) {
                        if (closest) {
                            if (d.index < closest) {
                                closest = d;
                            }
                        } else {
                            closest = d;
                        }
                        d.y = j;

                    }
                }
                j++
            })
            var end = closest
            elements.push([b, end])
            var f = ends.splice(end.y, 1);
        })
        if (k != 0) {
            FindEnd(k - 1, false);
        } else return;

    }

    FindEnd(deepest, true)
        var final;
       var final = addChildren(elements.length - 1);

    function addChildren(index) {
        var startindex = elements[index][0].index;
        var endindex = elements[index][1].index;
        var element;
        element = elements[index][0]
        var children = []
        var final = {}
        if (startindex + 1 != endindex) {
            var tocheck = []
            for (var z = startindex + 1; z <= endindex - 1; z++) {
                tocheck.push(z)
            }
            tocheck.forEach(function (d) {
                var eleindexe = undefined;
                var textindexe = undefined;
                var selfclosingindexe = undefined;
                var s = 0;
                var j = 0;
                elements.forEach(b => {
                    if (b[0].index == d) {
                        eleindexe = s;
                    }
                    s++;
                })
                text.forEach(b => {
                    if (b.index == d) {
                        textindexe = j;
                    }
                    j++;
                })
                selfclosing.forEach(b => {
                    if (b.index == d) {
                        selfclosingindexe = j;
                    }
                    j++;
                })
                if (eleindexe != undefined) {
                    if (elements[eleindexe][0].index + 1 != elements[eleindexe][1].index) {
                        children.push(addChildren(eleindexe));
                        elements.splice(eleindexe - 1, 1)
                    } else {
                        children.push({ "type": elements[eleindexe][0].type, "props": elements[eleindexe][0].props, "children": [] })
                        elements.splice(eleindexe - 1, 1)
                    }
                }
                if (textindexe != undefined) {
                    children.push(text[textindexe].text);
                    text.splice(textindexe, 1)
                }
                if (selfclosingindexe != undefined) {
                    var selfele = selfclosing[selfclosingindexe];
                    children.push({ "type": selfele.type, "props": selfele.props });
                    selfclosing.splice(selfclosingindexe, 1);
                }
                final = { "type": element.type, "props": element.props, "children": children }
            })
        } else {
            final = { "type": element.type, "props": element.props }
        }
        return final;


    }
    return final;
}
export default compile;