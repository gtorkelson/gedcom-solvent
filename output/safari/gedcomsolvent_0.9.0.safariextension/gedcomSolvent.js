GedcomSolvent = Object.create(
  {
    init: function () {
      this.placeButton();
      if (this.preparing) {
        this.downloadGedcom(true);
      }
    },
    downloadGedcom: function (isPreparing) {
      var self = this;
      var prepare = isPreparing ? P.resolve(true) : this.prepare();
      return prepare
      .then(function (prepared) {
        self.preparing = false;
        if (prepared) {
          return self.onPrepared();
        }
      })
      .catch(function (err) {
        alert(err.stack);
      })
      .finally(function () {
      });
    },
    prepare: function () {
      // this.preparing = true;
      return P.resolve();
    },
    onPrepared: function () {
      // this.preparing = true;
      return this.solve()
      .then(this.download);
    },
    solve: function () {
      return P.resolve();
    },
    download: function (proband) {
      var gc = Gedcom.create(proband, this.source);
      gc.download();
      return P.resolve();
    },
    prepareButtonParent: function () {
      // return a jq element that is ready to contain the solvent button]
      // probably will want ot create a new dom element to contain it,
      // so this function is likely to have that side effect
      return $('body');
    },
    createButton: function () {
      var self = this;
      var button = $(document.createElement('button'));
      button.text('Download GEDCOM');
      button.css('background-color', 'orange');
      button.click(function () {
        self.downloadGedcom();
        return false;
      });
      return button;
    },
    placeButton: function () {
      this.prepareButtonParent().append(this.createButton());
    }
  },
  {
    sourceId: {
      get: function () {
        // be default we identify a source by its full URL -- override this
        // if the only way to identify the source is from content on the page
        return window.location.href;
      }
    },
    preparing: {
      get: function () {
        var isPreparing = !!(
          kango.storage.getItem('gedcomSolvent:' + this.sourceId)
        );
        return isPreparing;
      },
      set: function (val) {
        if (!val) {
          kango.storage.removeItem('gedcomSolvent:' + this.sourceId);
        }
        else {
          kango.storage.setItem('gedcomSolvent:' + this.sourceId, true);
        }
      }
    }

  }

);
