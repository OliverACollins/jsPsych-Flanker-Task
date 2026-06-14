// -----------------------
// LSL bridge (promise-based)
// -----------------------
var lslBaseTime = null

function syncLSL() {
    return new Promise(async function (resolve, reject) {
        try {
            let offsets = []
            for (let i = 0; i < 3; i++) {
                var startPerf = performance.now()
                let resp = await fetch("http://192.168.46.216:5000/sync", { cache: "no-store" }) // change IPv4 address as appropriate
                let text = await resp.text()
                var lslTime = parseFloat(text)
                var endPerf = performance.now()
                var perfMid = (startPerf + endPerf) / 2
                offsets.push(lslTime - perfMid / 1000)
                await new Promise((r) => setTimeout(r, 100)) // Short delay between syncs
            }
            lslBaseTime = offsets.reduce((a, b) => a + b, 0) / offsets.length
            console.log("LSL sync done (averaged):", lslBaseTime)
            resolve(lslBaseTime)
        } catch (e) {
            console.error("LSL sync exception:", e)
            reject(e)
        }
    })
}

function sendMarker(value = "1") {
    // If not synced, still send marker (server will timestamp with local_clock())
    if (lslBaseTime === null) {
        console.warn("LSL not synced yet - sending without JS timestamp")
        fetch("http://192.168.46.216:5000/marker?value=" + encodeURIComponent(value)) // change IPv4 address as appropriate
            .then(function () {
                console.log("sent marker (no-ts)", value)
            })
            .catch(function (err) {
                console.error("Marker send error:", err)
            })
        return
    }

    var ts = lslBaseTime + performance.now() / 1000
    var url = "http://192.168.46.216:5000/marker?value=" + encodeURIComponent(value) + "&ts=" + encodeURIComponent(ts) // change IPv4 address as appropriate
    fetch(url)
        .then(function () {
            console.log("sent marker", value, "ts", ts)
        })
        .catch(function (err) {
            console.error("Marker send error:", err)
        })
}


var instructions = {
    type: jsPsychHtmlButtonResponse,
    choices: ["Continue"],

    stimulus:`
    <h2><b>Arrow Task</b></h2>
        <p>In this task, you will see <b>5 arrows</b> presented on the screen, such as like this:</p>
        <p align="center"
        <figure>
        <img src = "media/flanker_example.png" width = 30%"/>
        </figure>
        </p>
        <p>When the <b>MIDDLE arrow</b> points to the <b>left (<)</b>, press the <b>LEFT arrow key</b> on the keyboard.</p>
        <p>When the <b>MIDDLE arrow</b> points to the <b>right (>)</b>, press the <b>RIGHT arrow key</b> on the keyboard.</p>
        <br>
        <p>In this game of speed and reflex, you will need to select the correct response according to the orientation of the middle arrow as fast and as correctly as possible, while <b>resisting the surrounding arrows</b>.</p>
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
        "<div style='font-size:80px; position:fixed; text-align: center; top:50%; bottom:50%; right:20%; left:20%'>+</div>",
    choices: ["s"],
    trial_duration: random_duration // random duration between 500 and 1000 ms
}

// (timed-out trials have response === null, so they count as incorrect)
var flanker_on_finish = function(data) {
    var correct_key = data.target_direction === 'left' ? 'ArrowLeft' : 'ArrowRight';
    data.correct = data.response === correct_key;
}

var trial_congruent_l = {
  type: jsPsychHtmlKeyboardResponse,
  on_start: function () {
        create_marker(marker1, (color = "black"));
        sendMarker("1");
  },
  stimulus: "<div style='font-size:150px; position:fixed; text-align: center; top:50%; bottom:50%; right:20%; left:20%'> < < < < < </div>",
  trial_duration: 2000,
  post_trial_gap: 500,
  choices: ['ArrowLeft','ArrowRight'],
  data: {
    task: 'flanker',
    stimulus_type: 'congruent',
    target_direction: 'left'
  },
  on_finish: function (data) {
    document.querySelector("#marker1")?.remove()
    sendMarker("0");
  },
   flanker_on_finish
}

var trial_congruent_r = {
  type: jsPsychHtmlKeyboardResponse,
  on_start: function () {
        create_marker(marker1, (color = "black"));
        sendMarker("1");
  },
  stimulus: "<div style='font-size:150px; position:fixed; text-align: center; top:50%; bottom:50%; right:20%; left:20%'> > > > > > </div>",
  trial_duration: 2000,
  post_trial_gap: 500,
  choices: ['ArrowLeft','ArrowRight'],
  data: {
    task: 'flanker',
    stimulus_type: 'congruent',
    target_direction: 'right'
  },
  on_finish: function (data) {
    document.querySelector("#marker1")?.remove()
    sendMarker("0");
  },
   flanker_on_finish
}

var trial_incongruent_l = {
  type: jsPsychHtmlKeyboardResponse,
  on_start: function () {
        create_marker(marker1, (color = "black"));
        sendMarker("1");
  },
  stimulus: "<div style='font-size:150px; position:fixed; text-align: center; top:50%; bottom:50%; right:20%; left:20%'> > > < > > </div>",
  trial_duration: 2000,
  post_trial_gap: 500,
  choices: ['ArrowLeft','ArrowRight'],
  data: {
    task: 'flanker',
    stimulus_type: 'incongruent',
    target_direction: 'left'
  },
  on_finish: function (data) {
    document.querySelector("#marker1")?.remove()
    sendMarker("0");
  },
   flanker_on_finish
}

var trial_incongruent_r = {
  type: jsPsychHtmlKeyboardResponse,
  on_start: function () {
        create_marker(marker1, (color = "black"));
        sendMarker("1");
  },
  stimulus: "<div style='font-size:150px; position:fixed; text-align: center; top:50%; bottom:50%; right:20%; left:20%'> < < > < < </div>",
  trial_duration: 2000,
  post_trial_gap: 500,
  choices: ['ArrowLeft','ArrowRight'],
  data: {
    task: 'flanker',
    stimulus_type: 'incongruent',
    target_direction: 'right'
  },
  on_finish: function (data) {
    document.querySelector("#marker1")?.remove()
    sendMarker("0");
  },
   flanker_on_finish
  
}

//var trial_neutral_l = {
  //type: jsPsychImageKeyboardResponse,
  //stimulus: 'media/neutral_left.png',
  //stimulus_width: 1000,
  //trial_duration: 2000,
  //post_trial_gap: 500,
  //choices: ['ArrowLeft','ArrowRight'],
  //data: {
    //task: 'flanker',
    //stimulus_type: 'neutral',
    //target_direction: 'left'
  //},
  //on_finish: flanker_on_finish
//}

//var trial_neutral_r = {
  //type: jsPsychImageKeyboardResponse,
  //stimulus: 'media/neutral_right.png',
  //stimulus_width: 1000,
  //trial_duration: 2000,
  //post_trial_gap: 500,
  //choices: ['ArrowLeft','ArrowRight'],
  //data: {
    //task: 'flanker',
    //stimulus_type: 'neutral',
    //target_direction: 'right'
  //},
  //on_finish: flanker_on_finish
//}

var begin = {
    type: jsPsychHtmlButtonResponse,
    choices: ["Continue"],

    stimulus:`
    <h2><b style="color: #10db10;">Main Task</b></h2>
        <p>Now, we can move onto the main experimental trials.</p>
        <p>Again, in this task, you will see <b>5 arrows</b> presented on the screen, such as like this:</p>
        <p align="center"
        <figure>
        <img src = "media/flanker_example.png" width = 30%"/>
        </figure>
        </p>
        <p>When the <b>MIDDLE arrow</b> points to the <b>left (<)</b>, press the <b>LEFT arrow key</b> on the keyboard</p>
        <p>When the <b>MIDDLE arrow</b> points to the <b>right (>)</b>, press the <b>RIGHT arrow key</b> on the keyboard</p>
        <br>
        <p>In this game of speed and reflex, you will need to select the correct response according to the orientation of the middle arrow as fast and as correctly as possible, while <b>resisting the surrounding arrows</b>.</p>
        <br>
        <p>You have a maximum of 2 seconds to respond to each trial.</p>
        <br>
        <p>Press "Continue" to start the experimental trials.</p>
    `
}

// builds one block of randomised trials, tagged with a block label
function make_block(block_label, reps) {
    var block_trials = [
        { timeline: [fixation, trial_congruent_l] },
        { timeline: [fixation, trial_congruent_r] },
        { timeline: [fixation, trial_incongruent_l] },
        { timeline: [fixation, trial_incongruent_r] }
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
            " %</p>"
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
var flanker_ies_mean = 1000
var flanker_ies_sd = 400

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