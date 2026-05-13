const types = require('../scorecard/components/match_types');

// Compute the live running 3-dart average and the first-9 average for an X01
// or X01HANDICAP player, using only fields that the server updates atomically
// on visit commit: `player.darts_thrown` for the dart count, and the sum of
// `visit.score` over `leg.visits` for the score. Deliberately avoids
// `player.current_score`, which is mutated dart-by-dart on the client when
// `subtract_per_dart` is enabled and would produce wrong intermediate values.
function computeAvgs(player, leg, matchType) {
    if (matchType !== types.X01 && matchType !== types.X01HANDICAP) {
        return { show: false, running: null, firstNine: null };
    }

    const darts = (player && player.darts_thrown) || 0;
    if (darts === 0) {
        return { show: true, running: null, firstNine: null };
    }

    let totalScore = 0;
    let firstNineScore = 0;
    let visitCount = 0;
    if (leg && leg.visits) {
        for (const visit of leg.visits) {
            if (visit.player_id !== player.player_id) continue;
            if (!visit.is_bust) {
                totalScore += visit.score || 0;
                if (visitCount < 3) {
                    firstNineScore += visit.score || 0;
                }
            }
            visitCount++;
        }
    }

    const running = totalScore / darts * 3;

    let firstNine = null;
    if (darts >= 9) {
        firstNine = firstNineScore / 9 * 3;
    } else if (leg && leg.is_finished) {
        // Leg ended in fewer than 9 darts (fast 301 checkout). Mirror the
        // post-match `CalculateX01Statistics` formula so the live value seen
        // briefly before the page transitions matches the Match Result card.
        firstNine = running;
    }

    return { show: true, running, firstNine };
}

module.exports = computeAvgs;
