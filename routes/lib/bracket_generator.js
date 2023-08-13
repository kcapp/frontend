const debug = require('debug')('kcapp:bracket_generator');

const _ = require('underscore');
const fs = require('fs');
const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;

exports.generate = function(tournament, metadata, matches, players, current, callback) {
    if (tournament.preset_id) {
        exports.generateLast16(metadata, matches, players, current, callback);
    } else {
        exports.generateNew(metadata, matches, players, current, callback);
    }
}

exports.generateNew = function (metadata, matches, players, current, callback) {
    try {
        const bracketConference = fs.readFileSync('public/images/bracket_conference.svg', 'utf-8');
        const bracket = fs.readFileSync('public/images/bracket.svg', 'utf-8');

        const groupedMetadata = _.groupBy(metadata, (obj) => obj.tournament_group.id);
        const matchesMap = {};
        for (var key in matches) {
            _.extend(matchesMap, _.object(_.map(matches[key], function (match) { return [match.id, match] })));
        }

        const brackets = {};
        for (let group in groupedMetadata) {
            let doc = _.clone(new DOMParser().parseFromString(bracket, 'text/xml'));
            if (group == 13) {
                doc = _.clone(new DOMParser().parseFromString(bracketConference, 'text/xml'));
            }
            const matchMetadatas = groupedMetadata[group];
            for (let i = 0; i < matchMetadatas.length; i++) {
                const matchMetadata = matchMetadatas[i];
                const match = matchesMap[matchMetadata.match_id];

                let wins = 0;
                if (match.legs_won) {
                    wins = _.countBy(match.legs_won);
                }
                let prefix = matchMetadata.match_displayname.toLowerCase().replace(/ /g, "_");

                let preliminaryFinal = doc.getElementById("prelimination_final_show");
                if (group == 12) {
                    preliminaryFinal.setAttribute("opacity", "1.0");
                } else {
                    if (preliminaryFinal) {
                        preliminaryFinal.setAttribute("opacity", "0.0");
                    }
                }

                const home = matchMetadata.player_home;
                const away = matchMetadata.player_away;
                const winsHome = wins[home] ? "" + wins[home] : match.is_finished ? "0" : "";
                const winsAway = wins[away] ? "" + wins[away] : match.is_finished ? "0" : "";

                doc.getElementById(prefix + "_player_home").childNodes[0].data = players[home].first_name;
                doc.getElementById(prefix + "_player_away").childNodes[0].data = players[away].first_name;
                doc.getElementById(prefix + "_player_home_score").childNodes[0].data = winsHome;
                doc.getElementById(prefix + "_player_away_score").childNodes[0].data = winsAway;

                let currentMatch = doc.getElementById(prefix + "_current_match");
                if (current === matchMetadata.match_displayname) {
                    currentMatch.setAttribute("opacity", "1.0");
                } else {
                    currentMatch.setAttribute("opacity", "0.0");
                }
            }
            brackets[group] = new XMLSerializer().serializeToString(doc);
        }
        callback(undefined, brackets);
    } catch (error) {
        callback(error, null);
    }
}

exports.generateLast16 = function (metadata, matches, players, current, callback) {
    try {
        const bracket = fs.readFileSync('public/images/bracket_last16.svg', 'utf-8');
        const groupedMetadata = _.groupBy(metadata, (obj) => obj.tournament_group.id);
        const matchesMap = {};
        for (let key in matches) {
            _.extend(matchesMap, _.object(_.map(matches[key], (match) => [match.id, match] )));
        }

        const brackets = {};
        for (let group in groupedMetadata) {
            let doc = _.clone(new DOMParser().parseFromString(bracket, 'text/xml'));

            const matchMetadatas = groupedMetadata[group];
            //// Check if two players in this group have the same name, and if so extend their names with last name
            //const participants = matchMetadatas
            //    .map(metadata => {
            //    const home = players[metadata.player_home];
            //    const away = players[metadata.player_away];
            //    return [ { id: home.id, name: `${home.first_name} ${home.last_name}`},
            //             { id: away.id, name: `${away.first_name} ${away.last_name}`} ];
            //}).flat();
            //console.log([...new Set(participants)]);

            for (let i = 0; i < matchMetadatas.length; i++) {
                const matchMetadata = matchMetadatas[i];
                const match = matchesMap[matchMetadata.match_id];

                let wins = 0;
                if (match.legs_won) {
                    wins = _.countBy(match.legs_won);
                }
                const prefix = matchMetadata.match_displayname.toLowerCase().replace(/ /g, "_");
                const home = matchMetadata.player_home;
                const away = matchMetadata.player_away;
                const winsHome = wins[home] ? "" + wins[home] : match.is_finished ? "0" : "";
                const winsAway = wins[away] ? "" + wins[away] : match.is_finished ? "0" : "";
                const homeName = players[home].is_placeholder ? (match.is_bye ? "bye" : "") : `${players[home].first_name} ${players[home].last_name.substring(0, 1)}`;
                const awayName = players[away].is_placeholder ? (match.is_bye ? "bye" : "") : `${players[away].first_name} ${players[away].last_name.substring(0, 1)}`;
                doc.getElementById(`${prefix}_player_home`).childNodes[0].data = homeName;
                doc.getElementById(`${prefix}_player_away`).childNodes[0].data = awayName;
                doc.getElementById(`${prefix}_player_home_score`).childNodes[0].data = winsHome;
                doc.getElementById(`${prefix}_player_away_score`).childNodes[0].data = winsAway;
                if (!match.is_bye && match.is_players_decided) {
                    // Only allow editing of matches which are not bye
                    doc.getElementById(`${prefix}_group`).setAttribute('onclick', `handleClick(${match.id})`);
                    doc.getElementById(`${prefix}_group`).setAttribute('class', "editable");
                }
            }
            if (matchMetadatas.length > 7) {
                // Show the last 16 matches
                doc.getElementById('last16').setAttribute('style', 'display: block');
            }
            if (matchMetadatas.length > 3) {
                // Show the last 16 matches
                doc.getElementById('last8').setAttribute('style', 'display: block');
            }            
            brackets[group] = new XMLSerializer().serializeToString(doc);
        }
        callback(undefined, brackets);
    } catch (error) {
        debug(`Error generating last 16 bracket: ${error}`);
        callback(error, null);
    }
}
