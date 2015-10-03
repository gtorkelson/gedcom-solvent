// ==UserScript==
// @name Gedcom Solvent (Gedmatch)
// @include http://v2.gedmatch.com/pedigree_text.php\?id_family=*
// @include http://gedmatch.com/pedigree_text.php\?id_family=*
// @include http://localhost:8080/index.html
// @require jquery-2.1.4.min.js
// @require bluebird.min.js
// @require gedcom.js
// @require gedcomSolvent.js
// ==/UserScript==

var gedmatchSolvent = Object.create(GedcomSolvent);
gedmatchSolvent.source = 'Gedcom Solvent (Gedmatch)';

gedmatchSolvent.prepareButtonParent = function () {
  var row = $('form[method="get"] tr');
  var col = $(document.createElement('td'));

  row.append(col);
  return col;
};

gedmatchSolvent.prepare = function () {
  var self = this;
  self.preparing = true;

  return Promise.bind(this)
  .then(this.ensure15Generations)
  // this code won't be hit if we needed to switch generations
  .then(function (isPrepared) {
    if (isPrepared) {
      this.preparing = false;
      return true;
    }
    else {
      return false;
    }
  })
  .catch(function (err) {
    throw new Error('Unable to prepare the page for download.\n\n' + err);
  });
};

gedmatchSolvent.ensure15Generations = function () {
  var sel = $('select[name="depth"]');
  if (parseInt(sel.val()) < 15) {
    sel.val('15');
    // jQuery can't do this!?!?!
    var event = new Event('change');
    sel[0].dispatchEvent(event);
    $('form[method="get"]').submit();
    // after which we will lose the rest of this code b/c
    // the page will reload
    return Promise.resolve(false);
  }
  else {
    return Promise.resolve(true);
  }

};

Object.defineProperty(gedmatchSolvent, 'sourceId', {
  get: function () {
    var idFam = $('input[name="id_family"]').attr('value');
    var idGed = $('input[name="id_ged"]').attr('value');
    return 'gedmatch/' + idFam + '/' + idGed;
  }
});

gedmatchSolvent.solve = function () {
  console.log('solve');

  var parseLines = function () {
    var probandLineIndex;
    var contentNodes = $('pre').contents();
    var lines = [];
    var line = {
      special: '',
      text: '',
      sex: undefined
    };
    var skipOne = true;
    contentNodes.each(function (i, node) {
      if (skipOne) {
        skipOne = false;
        return;
      }
      if (node.nodeName === 'BR') {
        if (line.special.indexOf('LEGEND') === 0) {
          line = {
            special: '',
            text: '',
            sex: undefined
          };
          return false;
        }
        lines.push(line);
        line = {
          special: '',
          text: '',
          sex: undefined
        };
      }
      else {
        if (node.nodeType === 3) {
          line.special += node.nodeValue;
        }
        else {
          var fontNode = false;
          if (node.firstChild && node.firstChild.nodeName === 'FONT') {
            fontNode = node.firstChild;
          }
          else {
            if (
              node.firstChild && node.firstChild.nextSibling &&
                  node.firstChild.nextSibling.nodeName === 'FONT'
            ) {
              fontNode = node.firstChild.nextSibling;
            }
          }
          if (fontNode) {
            line.text += fontNode.textContent.trim();
            var color = fontNode.color;
            line.textBeginsAt = line.special.length + 1;
            if (line.textBeginsAt === 3) {
              line.isProband = true;
            }
            switch (color) {
              case 'blue':
                line.sex = 'M';
                break;
              case 'red':
                line.sex = 'F';
                break;
              default:
                line.sex = undefined;
            }
          }
        }
      }
    });

    var parseLine = function (lines, line, i) {
      var lineObj = {
        continuations: {},
        backSlashes: {},
        forwSlashes: {},
        text: line.text.length ? line.text : undefined,
        sex: line.sex,
        isProband: line.isProband,
        textBeginsAt: line.textBeginsAt
      };
      if (line.isProband) {
        probandLineIndex = i;
      }
      var pos;
      var name = '';
      for (pos = 0; pos < line.special.length; pos++) {
        var char = line.special[pos];
        switch (char.charCodeAt(0)) {
          case 32:
          case 160:
            break;
          case 124: // '|''
            lineObj.continuations[pos] = true;
            break;
          case 92: // '\\'
            lineObj.backSlashes[pos] = true;
            break;
          case 47: // '/'
          lineObj.forwSlashes[pos] = true;
            break;
          default:
            throw new Error(
              'Unexpected character: ' + line.special[pos] +
                  '(' + char.charCodeAt(0) + ')'
            );
        }
      }

      lines[i] = lineObj;
    };

    // var all = '';
    lines.forEach(function (line, i) {
      parseLine(lines, line, i);
      // all += JSON.stringify(lines[i]) + '\n';
    });

    // console.log(all);

    // in general, a parent's slash is 4 characters after a person's
    // text block begins
    var findFather = function (lines, personIndex) {
      var personLine = lines[personIndex];
      var parentsMarker = personLine.textBeginsAt + 4;
      if (
        lines[personIndex - 1] &&
        lines[personIndex - 1].forwSlashes[parentsMarker]
      ) {
        // there is a father
        var huntIndex = personIndex - 1;
        while (
          lines[huntIndex].continuations[parentsMarker] ||
          lines[huntIndex].forwSlashes[parentsMarker]
        ) {
          huntIndex--;
        }
        return huntIndex;
      }
    };
    var findMother = function (lines, personIndex) {
      var personLine = lines[personIndex];
      var parentsMarker = personLine.textBeginsAt + 4;
      if (
        lines[personIndex + 1] &&
        lines[personIndex + 1].backSlashes[parentsMarker]
      ) {
        // there is a father
        var huntIndex = personIndex + 1;
        while (
          lines[huntIndex].continuations[parentsMarker] ||
          lines[huntIndex].backSlashes[parentsMarker]
        ) {
          huntIndex++;
        }
        return huntIndex;
      }
    };


    var eventParse = function (eventStr) {
      var split = eventStr.split(', ');
      // if there is a date, it should be first
      var dateStr = split[0];
      var dateSplit = dateStr.split(' ');
      // if there is a year, it should be last
      var date = parseInt(dateSplit[dateSplit.length - 1]);
      var evt = {};
      if (!isNaN(date)) {
        evt.date = date;
        // and everything else should be a loc. (or missing)
        evt.place = eventStr.substr(dateStr.length + 2);
      }
      else {
        // we don't seem to have a date
        evt.place = eventStr;
      }

      return evt;
    };

    var nameParse = function (nameRaw) {
      var clean = nameRaw.split(',')[0];
      clean = clean.replace(/\//g, '');
      clean = clean.replace(/-/g, ' ').trim();
      var pieces = clean.split(' ');
      var name = {
        last: pieces[pieces.length - 1].trim()
      };
      pieces.pop();
      if (pieces.length > 0) {
        name.firstMiddle = pieces.join(' ').trim();
      }
      return name;
    };

    var makePerson = function (text, sex) {
      var person = Person.create();
      person.sex = sex;

      var name;

      var splitB = text.split(', b. ');
      var splitD;
      if (splitB.length === 2) {
        name = splitB[0].trim();
        splitD = splitB[1].split(', d. ');
        if (splitD.length === 2) {
          // the happy path
          person.birth = eventParse(splitD[0]);
          person.death = eventParse(splitD[1]);
        }
        else {
          // we didn't get a d.
          person.birth = eventParse(splitB[1]);
        }
      }
      else {
        // we didn't get a b.
        splitD = text.split(', d. ');
        if (splitD.length === 2) {
          name = splitD[0].trim();
          person.death = eventParse(splitD[1]);
        }
        else {
          // we didn't get a b. or a d. which means we know very litte
          // and can't even figure out where the name ends certainly,
          // so we need to chop it off at the first comma, potentially
          // losing the suffix -- oh, well
          name = text.split(',')[0].trim();
        }
      }

      var nameObj = nameParse(name);


      person.firstMiddle = nameObj.firstMiddle;
      person.last = nameObj.last;

      return person;
    };


    var solvePerson = function (lines, personIndex) {
      var personLine = lines[personIndex];
      var person = makePerson(personLine.text, personLine.sex);
      person.aid = personIndex;

      var fatherIndex = findFather(lines, personIndex);
      var motherIndex = findMother(lines, personIndex);

      person.parents = [];
      if (fatherIndex >= 0) {
        person.parents.push(solvePerson(lines, fatherIndex));
      }
      if (motherIndex >= 0) {
        person.parents.push(solvePerson(lines, motherIndex));
      }

      return person;
    };

    var printPerson = function (person) {
      console.log(person.toString());
      if (person.parents[0]) {
        console.log('   ' + person.parents[0].toString());
      }
      if (person.parents[1]) {
        console.log('   ' + person.parents[1].toString());
      }
    };

    var proband = solvePerson(lines, probandLineIndex);
    return proband;
  };

  var prob = parseLines();

  return Promise.resolve(prob);
};

$(function () {
  gedmatchSolvent.init();
});
