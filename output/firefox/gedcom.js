var Person = Object.create(
  {
    create: function () {
      return Object.create(Person);
    },
    toString: function () {
      var eventToString = function (evt) {
        var parts = [];
        if (evt.place) {
          parts.push(evt.place);
        }
        if (evt.date) {
          parts.push(evt.date);
        }
        if (parts.length) {
          return parts.join(', ');
        }
      };
      var val = this.firstMiddle + ' ' + this.last;
      if (this.birth || this.death) {
        var arr = [];
        if (this.birth) {
          arr.push('b. ' + eventToString(this.birth));
        }
        if (this.death) {
          arr.push('d. ' + eventToString(this.death));
        }
        val += ' (' + arr.join(', ') + ')';
      }
      return val;
    },
    asGedcom: function (child) {
      var s = '0 @I' + this.aid + '@ INDI\n';
      s += '1 NAME ';
      var parts = [];
      if (this.firstMiddle) {
        parts.push(this.firstMiddle);
      }
      if (this.last) {
        parts.push('/' + this.last + '/');
      }
      if (this.suff) {
        parts.push(this.suff);
      }
      s += parts.join(' ').trim() + '\n';
      if (this.sex) {
        s += '1 SEX ' + this.sex + '\n';
      }
      if (this.birth) {
        s += '1 BIRT\n';
        if (this.birth.date) {
          s += '2 DATE ' + this.birth.date + '\n';
        }
        if (this.birth.place) {
          s += '2 PLAC ' + this.birth.place + '\n';
        }
      }
      if (this.death) {
        s += '1 DEAT\n';
        if (this.death.date) {
          s += '2 DATE ' + this.death.date + '\n';
        }
        if (this.death.place) {
          s += '2 PLAC ' + this.death.place + '\n';
        }
      }
      s += '1 FAMC @F' + this.aid + '@\n';
      if (child) {
        s += '1 FAMS @F' + child.aid + '@\n';
      }

      return s;
    }
  },
  {
    fullname: {
      get: function () {
        var parts = [];
        if (this.firstMiddle) {
          parts.push(this.firstMiddle);
        }
        if (this.last) {
          parts.push(this.last);
        }
        if (this.suff) {
          parts.push(this.suff);
        }
        return parts.join(' ').trim();
      }
    }
  }
);

var Gedcom = Object.create(
  {
    create: function (proband, source) {
      var g = Object.create(Gedcom);
      g.proband = proband;
      g.source = source;
      return g;
    },
    download: function () {
      var filename = this.proband.fullname + '.ged';
      var mime = 'text/gedcom';
      var text = this.export();
      var element = document.createElement('a');
      element.setAttribute(
        'href', 'data:' + mime + ';charset=utf-8,' + encodeURIComponent(text)
      );
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

    },
    nameToString: function (person) {
      var nameParts = [];
      if (person.firstMiddle) {
        nameParts.push(person.firstMiddle);
      }
      if (person.last) {
        nameParts.push('/' + person.last + '/');
      }
      return nameParts.join(' ');
    },
    export: function () {
      var report = function (s, person, child) {
        s.s += person.asGedcom(child);
        person.parents.forEach(function (parent) {
          report(s, parent, person);
        });
        if (person.parents.length) {
          s.s += '0 @F' + person.aid + '@ FAM\n';
          var pIndex = 0;
          if (
            person.parents.length === 2 &&
            person.parents[0].sex === person.parents[1].sex
          ) {
            // some software does not accept same-sex marriages, and so
            // grudgingly we will call the first spouse the husband and the
            // second the wife in these case (lame)
            var parent = person.parents[0];
            s.s += '1 ' + 'HUSB' +
                ' @I' + parent.aid + '@\n';
            parent = person.parents[1];
            s.s += '1 ' + 'WIFE' +
                ' @I' + parent.aid + '@\n';
          }
          else {
            person.parents.forEach(function (parent) {
              s.s += '1 ' + (parent.sex === 'M' ? 'HUSB' : 'WIFE') +
                  ' @I' + parent.aid + '@\n';
            });
          }
          s.s += '1 CHIL @I' + person.aid + '@\n';
        }
      };

      var s = { };
      s.s = '0 HEAD\n1 SOUR ' + this.source + '\n';
      s.s += '1 SUBM @SUBM@\n1 GEDC\n2 VERS 5.5\n2 FORM LINEAGE-LINKED\n';
      s.s += '0 @SUBM@ SUBM\n1 NAME ' + this.nameToString(this.proband) + '\n';

      report(s, this.proband, null);

      s.s += '0 TRLR\n';

      return s.s;
    }

  }

);
