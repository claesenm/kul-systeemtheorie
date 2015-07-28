if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['underscore', 'mathjs'], function(_, math){

    function evalzorp(a, s) {
        return _.reduce(_.map(a, function(val){ return math.subtract(s, val);} ), function(memo, val){ return math.multiply(memo, val); });
    }


    return function System() {
        this.z = [];
        this.p = [];
        this.k = 1;


        this.eval = function(s) {
            var num = evalzorp(this.z, s)
            var denom = evalzorp(this.p, s)
            var quotient = math.divide(num, denom)
            return math.multiply(this.k, quotient)
        }
    }
})
