const math = require("mathjs");

function eval_query(query_string, callback) {
    try {
        var evaluation = math.evaluate(query_string);
        if (typeof evaluation == "object") {
            evaluation = evaluation.toJSON(); //-> toJSON () at https://mathjs.org/docs/datatypes/units.html#unittojson (Object type of Unit is returned by Function)
            callback(false, [{
                calc_result: math.round(evaluation.value, 4) + " " + evaluation.unit,
                calc_subtext: query_string.replace(/\s\s+/g, ' ') + " equals " + evaluation.value + " " + evaluation.unit,
            }]); 
        } else {
            callback(false, [{
                calc_result: math.round(evaluation, 4),
                calc_subtext: query_string.replace(/\s\s+/g, ' ') + " equals " + evaluation
            }]);
        }
    } catch (e) {
        callback(true)
    }
}

module.exports = eval_query;