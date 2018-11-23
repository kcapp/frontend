var debug = require('debug')('kcapp:bracket_generator');

var _ = require('underscore');
var fs = require('fs');
var DOMParser = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;

exports.generate = function (metadata, matches, players, current, callback) {
    fs.readFile('public/images/bracket.svg', 'utf-8', function (err, data) {
        if (err) {
            debug('Error when reading SVG ' + err);
            return;
        }
        var bracketSVG = new DOMParser().parseFromString(data, 'text/xml');
        var doc = _.clone(bracketSVG);
        var groupedMetadata = _.groupBy(metadata, (obj) => obj.tournament_group.id);

        var matchesMap = {};
        for (var key in matches) {
            _.extend(matchesMap, _.object(_.map(matches[key], function (match) {
                return [match.id, match]
            })));
        }

        var brackets = {};
        for (var group in groupedMetadata) {
            var matchMetadatas = groupedMetadata[group];

            for (var i = 0; i < matchMetadatas.length; i++) {
                var matchMetadata = matchMetadatas[i];
                var match = matchesMap[matchMetadata.match_id];

                var wins = 0;
                if (match.legs_won) {
                    wins = _.countBy(match.legs_won);
                }
                var prefix = matchMetadata.match_displayname.toLowerCase().replace(" ", "_");

                var preliminaryFinal = doc.getElementById("prelimination_final_show");
                if (group == 12) {
                    preliminaryFinal.setAttribute("opacity", "1.0");
                } else {
                    preliminaryFinal.setAttribute("opacity", "0.0");
                }
                var home = matchMetadata.player_home;
                var away = matchMetadata.player_away;

                doc.getElementById(prefix + "_player_home").childNodes[0].data = players[home].first_name;
                doc.getElementById(prefix + "_player_away").childNodes[0].data = players[away].first_name;
                doc.getElementById(prefix + "_player_home_score").childNodes[0].data = wins[home] ? "" + wins[home] : "0";
                doc.getElementById(prefix + "_player_away_score").childNodes[0].data = wins[away] ? "" + wins[away] : "0";

                var currentMatch = doc.getElementById(prefix + "_current_match");
                if (current === matchMetadata.match_displayname) {
                    currentMatch.setAttribute("opacity", "1.0");
                } else {
                    currentMatch.setAttribute("opacity", "0.0");
                }
            }
            brackets[group] = new XMLSerializer().serializeToString(doc);
        }
        callback(brackets);
    });
}