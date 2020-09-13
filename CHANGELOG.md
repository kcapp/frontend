# Changelog

A preview of major changes can be found in the Wiki ([Latest Changes](https://github.com/kcapp/frontend/wiki/Latest_Changes))

## [unreleased] - TBD
#### Feature
- Added new game types `Tic-Tac-Toe`, `Bermuda Triangle`, and `420`

#### Changed
- Statistics grouped by office of match instead of player

#### Fixed
- Starting score resetting when changing attribute on match create page
- Using origin of request to make sure requests towards backend work from multiple hosts/IPs


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

[unreleased]: https://github.com/kcapp/frontend/compare/v1.1.0...develop
[1.1.0]: https://github.com/kcapp/frontend/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/kcapp/frontend/releases/tag/v1.0.0
