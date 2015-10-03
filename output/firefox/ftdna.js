// ==UserScript==
// @name Gedcom Solvent (FTDNA)
// @include https://www.familytreedna.com/my/family-tree/share\?k=*
// @include https://www.familytreedna.com/my/family-tree
// @require jquery-2.1.4.min.js
// @require bluebird.min.js
// @require gedcom.js
// @require gedcomSolvent.js
// ==/UserScript==


var ftdnaSolvent = Object.create(GedcomSolvent);
ftdnaSolvent.source = 'Gedcom Solvent (FamilyTree DNA)';

ftdnaSolvent.prepareButtonParent = function () {
  var settingsCont = $('#settings-container');
  return settingsCont;
};

ftdnaSolvent.prepare = function () {
  var self = this;
  self.preparing = true;

  return Promise.bind(this)
  .then(this.ensureAncestryView)
  .then(this.ensureAllGenerations)
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

ftdnaSolvent.waitSpinnerRoundTrip = function () {
  // this is all about
  // <div id="loading-overlay" style="display: none;"></div>
  var spinner = $('#loading-overlay');
  return new Promise(function (res, rej) {
    spinnerDone = res;
    var interval = setInterval(function () {
      if (spinner.css('display') === 'none') {
        clearInterval(interval);
        res();
      }
    }, 250);
  });
};

ftdnaSolvent.ensureAncestryView = function () {
  var self = this;
  var ancestryViewButton = $('#ancestry-view');
  if (ancestryViewButton.hasClass('unselect')) {
    // definitely initiate the spinner promise first as we need to be
    // sure that it is displayed before we can ensure that it has been
    // subsequently hidden
    var p = self.waitSpinnerRoundTrip();
    ancestryViewButton.click();
    return p;
  }
  else {
    return Promise.resolve();
  }
};

ftdnaSolvent.ensureAllGenerations = function () {
  //                 <select id="display-generations">
  //                     <option value="1">1</option>
  //                     <option value="2">2</option>
  //                     <option value="3">3</option>
  //                     etc.
  var self = this;
  var displayGenerations = $('#display-generations');
  if (displayGenerations.val() !== '15') {
    var p = self.waitSpinnerRoundTrip();
    displayGenerations.val('15');
    // jQuery can't do this!?!?!
    var event = new Event('change');
    displayGenerations[0].dispatchEvent(event);
    return p
    .then(function () {
      return true;
    });
  }
  else {
    return Promise.resolve(true);
  }
};

ftdnaSolvent.solve = function () {
  var couples = $('.upstream-couple');
  // ftdna does proband's parents strangely


  var eventParse = function (eventStr) {
    var split = eventStr.split(',');
    var last = eventStr.substr(eventStr.lastIndexOf(',') + 1);
    var yr = eventStr.substr(last + 1).trim();
    yr = parseInt(last);
    var placeParts = eventStr.substr(0, last).trim();
    var realContent = placeParts.replace(/[ ,]/g, '');
    var event = {};
    if (!isNaN(yr)) {
      event.date = yr;
    }
    if (realContent.length) {
      event.place = placeParts.substr(0, placeParts.lastIndexOf(','));
    }
    return event;
  };

  var personFromMember = function (memberElement) {
    var detailChildren = memberElement
        .children().eq(0).children().eq(1).children();
    if (detailChildren.length) {
      var person = Person.create();
      person.sex = memberElement.hasClass('male') ? 'M' : 'F';
      person.firstMiddle = detailChildren.eq(0).text().trim();
      person.last = detailChildren.eq(1).text().trim();
      var b0 = detailChildren.eq(2);
      if (b0.length) {
        var b = b0[0].childNodes[1];
        person.birth = b ? eventParse(b.nodeValue.trim()) : null;
      }
      var d0 = detailChildren.eq(3);
      if (d0.length) {
        var d = d0[0].childNodes[1];
        person.death = d ? eventParse(d.nodeValue.trim()) : null;
      }

      // ugly fix for ftdna weirdeness
      if (person.last.indexOf('/') >= 0) {
        var lastOrig = person.last;
        person.last = person.last.substr(
          0, person.last.indexOf('/')
        ).trim();
        person.suff = lastOrig.substr(
          lastOrig.indexOf('/') + 1
        ).trim();
        var lastOrigNoSlash = person.last + ' ' + person.suff;
        if (person.firstMiddle.indexOf(lastOrigNoSlash) >= 0) {
          person.firstMiddle = person.firstMiddle.substr(
            0, person.firstMiddle.indexOf(lastOrigNoSlash)
          ).trim();
        }
      }

      return person;
    }
    else {
      return null;
    }
  };

  var people = {};
  couples.each(function (i, c) {
    var couple = $(c);
    var aid = parseInt(couple.attr('data-index')) * 2;
    couple.find('.member').each(function (j, m) {
      var member = $(m);
      var person = personFromMember(member);
      if (person) {
        person.aid = aid + j;
        people[person.aid] = person;
      }
    });
  });
  var probandMember = $('.tree-owner');
  var probandPerson = personFromMember(probandMember);
  probandPerson.aid = 1;

  var parents = $('#lowerGenerations');
  var aid = 2;
  parents.find('.member:lt(2)').each(function (j, m) {
    var member = $(m);
    var person = personFromMember(member);
    if (person) {
      person.aid = aid + j;
      people[person.aid] = person;
    }
  });

  var setParents = function (person) {
    // if we had a very deep tree we could worry about this algorithm
    // and opt of TCO or a loop but we're dealing in an auDNA
    // timeframe here
    person.parents = [];
    var parentsAid = person.aid * 2;
    var p1 = people[parentsAid];
    var p2 = people[parentsAid + 1];
    if (p1) {
      person.parents.push(p1);
      setParents(p1);
    }
    if (p2) {
      person.parents.push(p2);
      setParents(p2);
    }
  };

  setParents(probandPerson);

  return Promise.resolve(probandPerson);
};

$(function () {
  ftdnaSolvent.init();
});
