# Gedcom Solvent

> Render GEDCOM files from select family tree sources.

## Introduction

The Gedcom Solvent browser extension enables a one-click download of a GEDCOM file from supported websites. It is intended to aid in (typically autosomal) DNA-based genealogy research. The typical use case is as a step in the finding of common ancestors among DNA test participants.

By using this software or derivative works, you agree not to publish (or cause to be published) any data retrieved or do anyting with it that would even remotely resemble the violation of someone's privacy. The tool does not give you access to any data for which you have already been granted access by the owners of the site(s) on which you use it. (It also does not "phone home" or communicate with any other servers when you use it.)

As currently built, it can be used in recent versions of **Chrome** and **Firefox**. (Internet Explorer and Safari would require code-signing which is not anticipated to happen in this project, but anyone who agrees with the terms of the license may do so themselves.)

## What It does

The extension presents a single orange button, "Download Gedcom", on a supported page. When that button is clicked:

* The extension ensures that you have at least 15 generations set for display.
* It then gathers the data (as best it can!) and presents the GEDCOM file as a download. If your browser is set to present a window on download, it will, otherwise it may be stored automatically in your downloads directory.

From there you're on your own, but you would probably want to load the GEDCOM into your research tool(s) -- some tools support finding duplicates in GEDCOMs, which can be a great way to find common ancestors. Of course, you can also just build a big GEDCOM from the trees of DNA matches and look for them the "old fashioned" way. The one thing you are not allowed to do by license is publish the data (in any form) which you derive from your use of the extension.

## Installation/Usage

Install the appropriate build for your browser from the output directory.

* Chrome: download the [gedcomsolvent_0.9.1.crx](https://github.com/gtorkelson/gedcom-solvent/releases/download/v0.9.1/gedcomsolvent_0.9.1.crx) file, visit the local URL "chrome://extensions" in Chrome, and drag the crx file into that window. If Chrome prevents you from installing extensions not installed from the Web Store, see [this helpful page](http://lifehacker.com/install-chrome-extensions-from-outside-the-store-with-d-1596918011).
* Firefox: download the [gedcomsolvent_0.9.1.xpi](https://github.com/gtorkelson/gedcom-solvent/releases/download/v0.9.1/gedcomsolvent_0.9.1.xpi) file, visit the local URL "about:addons" in Firefox, and drag the xpi file into that window.

**_In some cases, your browser may initiate the install process automatically when you download the file... you will have the opportunity to confirm or cancel if this happens._**

Thereafter, on a supported site/page, the extension will present itself as an orange button. If less than 15 generations are displayed, the extension will cause them to be displayed, and then initiate the download.

### Supported sites

* FamilyTree DNA trees (i.e. ones that look like `https://www.familytreedna.com/my/family-tree/share?k=a-bunch-of-numbers`)
* GEDMatch Pedigree views (i.e. ones that look like `http://v2.gedmatch.com/pedigree_text.php?id_family=9518201&id_ged=I5803`)
* Other Ideas? (23andme would require help from someone who has access to it...)

### Feedback / Contributions

*This is an alpha release. Bugs may be present. Please report any which you find. File a Github issue if you wish to leave feedback. Pull requests are more than welcome.*

## License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

You MAY NOT use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software to violate anyone's privacy, or by  in so doing
cause anyone's privacy to be violated. In particular, you MUST ENSURE that
information generated by you from this software or from your derivative works of
it is not posted, published or saved in a publicly accessible place.

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
