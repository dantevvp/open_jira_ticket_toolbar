# Open JIRA Ticket Extension
[![Code Climate](https://codeclimate.com/github/jjwong/open_jira_ticket_toolbar/badges/gpa.svg)](https://codeclimate.com/github/jjwong/open_jira_ticket_toolbar)
[![Issue Count](https://codeclimate.com/github/jjwong/open_jira_ticket_toolbar/badges/issue_count.svg)](https://codeclimate.com/github/jjwong/open_jira_ticket_toolbar)

# Download Extension
[![Open Jira Ticket @Chrome Web Store](https://developer.chrome.com/webstore/images/ChromeWebStore_Badge_v2_340x96.png "Open Jira Ticket @Chrome Web Store")](https://chrome.google.com/webstore/detail/open-jira-ticket/blblhnpjhhjdbgbcgmmldohpalmbedci?hl=en-US)

# Description
Simple Chrome extension that will allow a user to search for JIRA tickets via the address bar or the provided toolbar.

# Testing
This repository uses the standalone Jasmine installation to load up specs. You can re-run them manually to see results when viewing `/js/jasmine/SpecRunner.html`

You can view the coverage summary in the command line when you run `npm coverage`.
For more information, you can view the the full report under the `coverage/Chrome Headless (version **)/loc-report` directory and search for `index.html`.

All pushes to the master branch will sync the coverage data to code climate.

# Changelog
* 3.0
	* Upgrade to manifest v3
	* Remove travis and codecov
	* Move to from qunit to jasmine and update unit tests
	* Remove jquery implementation of i18n
	* Remove favorites feature
	* Simplify, update and remove cruft
* 2.0
	* Add top 5 favorites feature
* 1.1
	* Add localization for English, Spanish, French, German and Russian
* 1.0
	* Full release of Chrome Extension.
		* Default Project
		* Selectable History
		* Omnibox support
		* Keyboard shortcut support
		* Cleaner look
* 0.2
	* Beta release
		* Core functionality testing
