# Changelog
A preview of major changes can be found in the Wiki ([Latest Changes](https://github.com/kcapp/frontend/wiki/Latest_Changes))

## [2.8.0] - TBD
#### Feature
- New game type `170`
- "Badges" page showing overview of all badges and how many players have unlocked them
- New Darts Per Leg `DPL` metric added to tournament overview
- Convenience method for scoring a user checkout by pressing `55` on numpad
- Option to select which TTS voice to use per venue
- Tournament Predictor
- Ability to configure bots from Tablet Controller
- New set of larger Compact buttons
- Lots of new Badges

#### Changed
- Don't show `Rematch` and `Undo Leg Finish` on old legs
- Display darts throw for certain badges
- Don't show change order modal if button input is enabled
- Hide Elo for players with Elo <1000
- Use multipler as points in `Around the World` and `Shanghai` instead of value

#### Fixed
- Fixed player Elo Changelog
- Minor fixes to Tablet controller
- Issue where match wouldn't start if venue was selected on office all

## [2.7.0] - 2023-09-12
#### Feature
- Automatically start next leg without needing to reload the page to improve load time, and get back to throwing quicker
- Forward clients back to main page from match result after 2 minutes
- New "Explore" tab on player statistics, to explore darts thrown
- Support for `ANY` and `MASTER` outs for `x01` legs
- Simplified input for `x01` legs

#### Changed
- Updated to use `Node.js v18`
- Updated dependencies to newer versions

## [2.6.0] - 2023-06-30
#### Feature
- Support for Tournament Presets
- New query parameter `officeId=<id>` for `/obs` view, to only forward on matches in a given office
- Practice against `first time`, `very easy`, `challenging` and `mvg` bots
- New button for swapping order if button input is enabled
- Better handling for bluetooth keyboards on Android

#### Changed
- Always reset multipler to `1` on compact button entry
- Switched the `Invalid Score` alert to a simple notification

#### Fixed
- Bug where vocal announcement for Cricket would say "No score" instead of marks

## [2.5.0] - 2023-03-10
#### Feature
- Support multiple legs for Practice matches
- Player options to disable automatic score deduction per dart, and to show/hide checkout guide
- Allow undoing of visits when playing against kcapp-bot

#### Changed
- More vocal announcements
- Improved Checkout Suggestions for x01

#### Fixed
- Issue with Mock-Player Bots (Contributed by @lluni)
- Bug where Bot would sometime get stuck in infinite loop on certain scores
- Bug where starting score for Gotcha would be incorrect

## [2.4.0] - 2022-10-21
#### Feature
- Set venue when warmup of a match starts, to make it possible to play matches on a different venue than scheduled
- Emit `order_changed` event on leg namespace
- Display visits in reverse order on spectate page
- Additional tournament statistics displayed on statistics page
- New view for `tournaments/<id>/obs` which shows a counter for certain statistics in a given tournament
- New `Scam` match type
- Voice announcements for `marks` hit in `Cricket`
- Next Match button for Tournament results to easily move to next match

#### Changed
- Added JDC shirt to spectate page
- More vocal announcements

#### Fixed
- Fixed broken office selector on players page
- Bot waiting on initial throw
- Prevent spamming of 'order_changes' when changing order
- Update wins per player on spectate page
- Issue where canceling bust dialog would submit two events
- Bug preventing creation of new tournaments
- Bug showing wrong per leg statistics on Head-to-Head page


## [2.3.0] - 2022-03-06
#### Feature
- Support for match presets, that can be configured via smartcards
- Switch player order by pressing `Tab` at the beginning of the match
- New button compact button layout and option to specify default button layout per device
- Vocal announcements for some scores >180 for JDC Practice
- Allow closing modals with `Backspace` button for easier navigation on Numpad
- Show current shirt color in JDC Practice
- Ability to add Tournament Groups from Admin page

#### Changed
- Show the `Change order` modal on the right side
- Don't prompt to delete visits when nothing is thrown
- Tooltip for JDC Shirts on leg result page
- Made all external resources available locally

#### Fixed
- Don't allow numbers to be stolen in Tic-Tac-Toe
- Fixed a bug with voice announcements not working on Draw

## [2.2.0] - 2021-12-04
#### Feature
- Support for reading player smartcard UIDs and adding player using smartcards
- New page `/venues/<id>/spectate` to spectate all matches at a given venue
- New button for `Next Match` on official tournament matches
- Additional custom voice announcements added
- New `Rematch`-button on match result page

#### Changed
- Support for other games types in OBS view
- Filter out "placeholder"-players on tournament overview page
- Correctly handle empty string vocal names
- Don't show `Rematch` button for Tournament matches
- Sort player by recently played on `index-controller`
- Reset screensaver timer on throw events on socket.io
- Correctly forward `index-controller` back to  home page on finished matches
- Prevent starting of mulitple matches from `index-controller`
- Player `elo` is shown on tournament standings

#### Fixed
- Correctly update `Tic-Tac-Toe` board between players
- Correctly handle `undo` in OBS view
- Set correct match type on Spectate page
- Bug displaying results for `X01 Handicap`

## [2.1.0] - 2021-10-17
#### Feature
- Added new game type `JDC Practice Routine`
- Added new game type `Knockout`
- Statistics for `X01 Handicap` type
- Buttons to filter players by name in controller
- Support for tie break game modes, with different type on last leg
- Bigger button layout mode for Tablet controllers

#### Changed
- Removed announcement of `0` score in `Cricket`
- Handle draw for 9 Dart Shootout between two players
- Reannounce start of match after 10s

#### Fixed
- Toggle Camera button to remove stream when not available
- Rendering bug when opening finished `Bermuda Triangle` matches
- Bug which allowed setting triple `Bull`
- Avoid forwaring on venue matches when already on the page
- Disable warmup button after first press
- `Continue match` from Controller if any match contained a bot
- Score incorrectly shown as not reset in `Gotcha`

## [2.0.0] - 2021-09-19
#### Feature
- Custom announcer for scores, match finishes, and more!
- Added new game type `Kill Bull`
- Added new game type `Gotcha`
- Added support for stream of board for each player using external stream URLs
- `Elo Changelog` page for player
- New `Controller` page optimized for tablets for easier starting of matches

#### Changed
- Added `Outshot Type` and `Tic-Tac-Toe` board to Spectate page
- Added `Bull` to `420` game type
- Correctly handle leg finish when multiple people are connected
- Updated to Marko 5
- Updated all dependencies to latest version

#### Fixed
- Score input for `X01 Handicap`
- Announce correct leg finished
- Issue causing new-leg announcements to be played twice
- Misc fixes and improvements


## [1.2.0] - 2020-10-10
#### Feature
- Added new game types `Tic-Tac-Toe`, `Bermuda Triangle`, and `420`

#### Changed
- Statistics grouped by office of match instead of player

#### Fixed
- Starting score resetting when changing attribute on match create page
- Using origin of request to make sure requests towards backend work from multiple hosts/IPs
- Removed some old unused methods
- Lots of minor fixes and improvements


## [1.1.0] - 2020-07-18
#### Feature
- New game types for `Around The World`, `Around The Clock`, and `Shanghai`
- Office selector to players, tournament and statistics page
- Venue selector on tournament admin page
- Added all game types to statistics page
- Section for global statistics on statistics page
- Simplified button inputs for Cricket
- Option to get QR code for current leg
- Option to show full set of buttons instead of simplified

#### Changed
- Multiple tweaks and improvments to multiple pages

#### Fixed
- Correctly show Top 10 statistics on tournament statistics page
- Allow cycling of scores with keyboard for supported game types
- Proper handling of error events when adding visits

## [1.0.0] - 2020-05-03
#### Feature
- Support for multiple game types, including `x01`, `9 Dart Shootout`, and `Cricket`
- Detailed statistics tracking for player scores, accuracy, Elo and more
- Practice mode against [kcapp-bot](https://github.com/kcapp/bot)
- Live spectating of games across locations
- Multiple score entry methods
    - Including [Unicorn Smartboard](https://github.com/kcapp/smartboard)

[2.8.0]: https://github.com/kcapp/frontend/compare/v2.7.0...develop
[2.7.0]: https://github.com/kcapp/frontend/compare/v2.6.0...v2.7.0
[2.6.0]: https://github.com/kcapp/frontend/compare/v2.5.0...v2.6.0
[2.5.0]: https://github.com/kcapp/frontend/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/kcapp/frontend/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/kcapp/frontend/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/kcapp/frontend/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/kcapp/frontend/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/kcapp/frontend/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/kcapp/frontend/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/kcapp/frontend/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/kcapp/frontend/releases/tag/v1.0.0
