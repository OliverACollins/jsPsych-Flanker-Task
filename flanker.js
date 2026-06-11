var instructions = {
    type: jsPsychHtmlButtonResponse,
    choices: ["Continue"],

    stimulus:`
    <h2><b>Arrow Task</b></h2>
        <p>In this task, you will see <b>5 arrows</b> presented on the screen, such as like this:</p>
        <p style="font-size: 100px;">  <  <  <  <  <  </p>
        <p>When the <b>MIDDLE arrow</b> points to the <b>left (<)</b>, press the <b>F key</b> on the keyboard.</p>
        <p>When the <b>MIDDLE arrow</b> points to the <b>right (>)</b>, press the <b>J key</b> on the keyboard.</p>
        <br>
        <p>In this game of speed and reflex, you will need to select the correct response according to the orientation of the middle arrow as fast and as correctly as possible, while <b>resisting the surrounding arrows.</b></p>
        <br>
        <p>You have a maximum of 2 seconds to respond to each trial.</p>
        <br>
        <p>You will first have a chance to practice this task. Press "Continue" to start the practice trials.</p>
    `
}

var random_duration = function() {
    var durations = [500, 600, 700, 800, 900, 1000];
    return durations[Math.floor(Math.random() * durations.length)];
}

var fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus:
        "<div style='font-size:500%; position:fixed; text-align: center; top:50%; bottom:50%; right:20%; left:20%'> + </div>",
    choices: ["s"],
    trial_duration: random_duration // random duration between 500 and 1000 ms
}

// shared on_finish: scores each flanker trial as correct/incorrect
// (timed-out trials have response === null, so they count as incorrect)
var flanker_on_finish = function(data) {
    var correct_key = data.target_direction === 'left' ? 'f' : 'j';
    data.correct = data.response === correct_key;
}

var trial_congruent_l = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<div style='font-size:150px; position:fixed; text-align: center; top:50%; bottom:50%; right:20%; left:20%'> < < < < < </div>",
  trial_duration: 2000,
  post_trial_gap: 500,
  choices: ['f','j'],
  data: {
    task: 'flanker',
    stimulus_type: 'congruent',
    target_direction: 'left'
  },
  on_finish: flanker_on_finish
}

var trial_congruent_r = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<p style="font-size: 150px;">  >  >  >  >  >  </p>',
  trial_duration: 2000,
  post_trial_gap: 500,
  choices: ['f','j'],
  data: {
    task: 'flanker',
    stimulus_type: 'congruent',
    target_direction: 'right'
  },
  on_finish: flanker_on_finish
}

var trial_incongruent_l = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<p style="font-size: 150px;">  >  >  <  >  >  </p>',
  trial_duration: 2000,
  post_trial_gap: 500,
  choices: ['f','j'],
  data: {
    task: 'flanker',
    stimulus_type: 'incongruent',
    target_direction: 'left'
  },
  on_finish: flanker_on_finish
}

var trial_incongruent_r = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<p style="font-size: 150px;">  <  <  >  <  <  </p>',
  trial_duration: 2000,
  post_trial_gap: 500,
  choices: ['f','j'],
  data: {
    task: 'flanker',
    stimulus_type: 'incongruent',
    target_direction: 'right'
  },
  on_finish: flanker_on_finish
}

var feedback = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
        var last_trial = jsPsych.data.get().last(1).values()[0];
        if (last_trial.correct) {
            return '<p style="color: green; font-size: 50px;">Correct</p>';
        } else {
            return '<p style="color: red; font-size: 50px;">Incorrect</p>';
        }
    },
    choices: "NO_KEYS",
    trial_duration: 1000,
}

var begin = {
    type: jsPsychHtmlButtonResponse,
    choices: ["Continue"],

    stimulus:`
    <h2><b style="color: #10db10;">Main Task</b></h2>
        <p>Now, we can move onto the main experimental trials.</p>
        <p>Again, in this task, you will see <b>5 arrows</b> presented on the screen, such as like this:</p>
        <p style="font-size: 100px;">  <  <  <  <  <  </p>
        <p>When the <b>MIDDLE arrow</b> points to the <b>left (<)</b>, press the <b>F key</b> on the keyboard</p>
        <p>When the <b>MIDDLE arrow</b> points to the <b>right (>)</b>, press the <b>J key</b> on the keyboard</p>
        <br>
        <p>In this game of speed and reflex, you will need to select the correct response according to the orientation of the middle arrow as fast and as correctly as possible, while <b>resisting the surrounding arrows.</b></p>
        <br>
        <p>You have a maximum of 2 seconds to respond to each trial.</p>
        <br>
        <p>Press "Continue" to start the experimental trials.</p>
    `
}

// builds one block of randomised trials, tagged with a block label
// block_label can be a number (1, 2, ...) or 'practice'
function make_block(block_label, reps) {
    var block_trials = [
        { timeline: [fixation, trial_congruent_l] },
        { timeline: [fixation, trial_congruent_r] },
        { timeline: [fixation, trial_incongruent_l] },
        { timeline: [fixation, trial_incongruent_r] },
    ];
    return {
        timeline: jsPsych.randomization.repeat(block_trials, reps),
        data: { block: block_label }
    };
}

// Math utilities =================================================================================
function cumulative_probability(x, mean, sd) {
    var z = (x - mean) / Math.sqrt(2 * sd * sd)
    var t = 1 / (1 + 0.3275911 * Math.abs(z))
    var a1 = 0.254829592
    var a2 = -0.284496736
    var a3 = 1.421413741
    var a4 = -1.453152027
    var a5 = 1.061405429
    var erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z)
    var sign = 1
    if (z < 0) {
        sign = -1
    }
    return (1 / 2) * (1 + sign * erf)
}

function round_digits(x, digits = 2) {
    return Number(Math.round(parseFloat(x + "e" + digits)) + "e-" + digits).toFixed(digits)
}

// IES after each block
function get_results(ies_mean, ies_sd, block_num) {
    if (typeof block_num != "undefined") {
        var trials = jsPsych.data.get().filter({ task: "flanker", block: block_num }) // results by block
    } else {
        var trials = jsPsych.data.get().filter({ task: "flanker" }) // overall results
    }
    var correct_trials = trials.filter({ correct: true })
    var proportion_correct = correct_trials.count() / trials.count()
    var rt_mean = trials.select("rt").mean()
    if (correct_trials.count() > 0) {
        var rt_mean_correct = correct_trials.select("rt").mean()
        var ies = rt_mean_correct / proportion_correct // compute inverse efficiency score
        var score_to_display = 100 - ies / 35
        if (score_to_display < 0) {
            score_to_display = 0
        }
        var percentile = 100 - cumulative_probability(ies, ies_mean, ies_sd) * 100
    } else {
        var rt_mean_correct = ""
        var ies = ""
        var percentile = 0
        var score_to_display = 0
    }
    return {
        accuracy: proportion_correct,
        mean_reaction_time: rt_mean,
        mean_reaction_time_correct: rt_mean_correct,
        inverse_efficiency: ies,
        percentage: percentile,
        score: score_to_display,
    }
}

function get_debrief_display(results, type = "Block") {
    if (type === "Block") {
        // Debrief at end of each block
        var score =
            "<p>Your score for this block is:</p>" +
            '<p style="color: black; font-size: 48px; font-weight: bold;">' +
            Math.round(results.score * 10) / 10 +
            " %</p>"
    } else if (type === "Final") {
        // Final debriefing at end of game
        var score =
            "<p>Your score for this block is:</p>" +
            '<p style="color: black; font-size: 48px; font-weight: bold;">' +
            Math.round(results.score) +
            " &</p>"
    }

    return {
        display_score: score,
        display_accuracy:
            "<p style='color:rgb(76,175,80);'>You responded correctly on <b>" +
            round_digits(results.accuracy * 100) +
            "%</b> of the trials.</p>",
        display_rt:
            "<p style='color:rgb(139, 195, 74);'>Your average response time was <b>" +
            round_digits(results.mean_reaction_time) +
            "</b> ms.</p>",
    }
}

// Population reference values for the IES distribution (used for the percentile).
// Replace with values from your own pilot/normative data when available.
var flanker_ies_mean = 1000
var flanker_ies_sd = 400

// builds an end-of-block screen showing the score (Illusion Game style)
// block_label can be a block number (1, 2, ...) or 'practice'
function make_block_finish(block_label, is_last) {
    var is_practice = block_label === 'practice'
    return {
        type: jsPsychHtmlButtonResponse,
        choices: ["Continue"],
        stimulus: function() {
            var results = get_results(flanker_ies_mean, flanker_ies_sd, block_label)
            var show_screen = get_debrief_display(results, is_last ? "Final" : "Block")

            var title = is_practice
                ? '<h2><b style="color: #10db10;">Practice Complete!</b></h2>'
                : '<h2><b style="color: #10db10;">Block ' + block_label + ' Complete!</b></h2>';

            var next_text;
            if (is_last) {
                next_text = '<p>This was the final block. Press "Continue" to finish.</p>';
            } else if (is_practice) {
                next_text = '<p>Press "Continue" to move on to the main task.</p>';
            } else {
                next_text = '<p>Can you do better in the next block?</p>';
            }

            return (
                title +
                show_screen.display_score +
                "<hr>" +
                show_screen.display_accuracy +
                show_screen.display_rt +
                "<hr>" +
                next_text
            );
        },
        data: { screen: is_practice ? 'practice_finish' : 'block_finish', block: block_label }
    };
}