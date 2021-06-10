const EDO = require("edo.js").EDO
let edo = new EDO(12)
const mod = (n, m) => {
    return ((n % m) + m) % m;
}
const JS = function (thing) {
    return JSON.stringify(thing).replace(/"/g,'')
}

const CJS = function (thing) {
    console.log(JS(thing))
}
const rand_int_in_range = function (min,max) {
    return Math.floor(Math.random() * (max - min +1)) + min
}

const rand_int_in_range_but_not_zero = function (min,max) {
    let val = Math.floor(Math.random() * (max - min +1)) + min
    while(val==0) val = Math.floor(Math.random() * (max - min +1)) + min
    return val
}
const unique_in_array = (list) => {

    let unique  = new Set(list.map(JSON.stringify));
    unique = Array.from(unique).map(JSON.parse);

    return unique
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const make_stimuli = function (subject_id,set_count=7,range=[0,12],length=12,set=[0,2,4,7,9]) {

    let time = Date.now()



    /**
    * Pseudo-randomizing
    * --------------------
    */
    //Shift up or down?
    let set_shift_array = shuffle(Array.from(Array(set_count)).map((el,i)=>(i<set_count/2)?-1:1))

    //Shift position (e.g. in 12 notes either 6th position or 7th (indexed 5 and 6))
    let set_note_to_shift = shuffle(Array.from(Array(set_count)).map((el,i)=>(i<set_count/2)?Math.ceil(length/2)-1:Math.ceil(length/2)))

    //Condition order
    let set_question_order = shuffle(Array.from(Array(set_count)).map((el,i)=>(i<set_count/2)?["shifted",'swapped']:["swapped",'shifted']))

    //Transposition array
    let transpositions = Array.from(Array(set_count)).map(el=>rand_int_in_range(-3,3))

    //Mode array
    let modes = shuffle(Array.from(Array(set_count)).map((el,i)=>i%set.length))





    let Q = []
    while(Q.length<set_count) {
        let mode_num = modes[0]
        let Q_mode = edo.scale(set).mode(mode_num).pitches
        let pitches = edo.get.random_melody(length,range,true,Q_mode,avoid_leaps=6,end_with_first=false)

        //Verify probe has all of the set's pitches
        let unique_pitches = Array.from(new Set(pitches.map(p=>edo.mod(p,12))))
        if (unique_pitches.length<set.length) continue;

        //Performing contour swap
        let swap_pos1 = Math.ceil(pitches.length/2)-1
        let swap_pos2 = Math.ceil(pitches.length/2)
        let swapped = [...pitches]
        var temp = swapped[swap_pos2]
        swapped[swap_pos2] = swapped[swap_pos1];
        swapped[swap_pos1] = temp;
        if(swapped[swap_pos1]==swapped[swap_pos2]) continue //if middle pitches are same


        let shifted = [...pitches]
        let note_to_shift = set_note_to_shift[0]
        let amount_to_shift = set_shift_array[0]
        let shift_direction = (amount_to_shift==-1) ? "down" : "up"

        //Avoid shifting "within" the set.
        shifted[note_to_shift] = shifted[note_to_shift] + amount_to_shift
        if(Q_mode.indexOf(edo.mod(shifted[note_to_shift],edo.edo))!=-1) continue

        //Make sure there are no repeated notes in any of the test conditions
        if(edo.convert.to_steps(pitches).indexOf(0)!=-1) continue
        if(edo.convert.to_steps(swapped).indexOf(0)!=-1) continue
        if(edo.convert.to_steps(shifted).indexOf(0)!=-1) continue

        //Transpose all the conditions
        let transposition = transpositions.shift()
        pitches = pitches.map(p=>p+transposition)
        swapped = swapped.map(p=>p+transposition)
        shifted = shifted.map(p=>p+transposition)

        let shift_pos = set_note_to_shift.shift()
        let shift_amount = set_shift_array.shift()
        modes.shift()
        let order = set_question_order.shift()
        Q.push({subject_id:subject_id,probe:pitches,swapped:swapped,shifted:shifted,shift_dir:shift_direction, shift_amount:shift_amount,shift_position: shift_pos,set:set,order:order,mode:Q_mode,mode_num:mode_num,transposition:transposition})
    }
    let stimuli = shuffle(Q)
    return stimuli
}



module.exports = make_stimuli


