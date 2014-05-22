/*
 * Polyfill for Function.prototype.bind.
 * PhantomJS doesn't support Function.prototype.bind until 2.0. We're currently on 1.9.
 * See https://github.com/ariya/phantomjs/issues/10522
 */

(function () {
    'use strict';
    if (typeof Function.prototype.bind !== "function") {
        Function.prototype.bind = function (context) {
            var slice = Array.prototype.slice;
            var fn = this;

            return function () {
                var args = slice.call(arguments, 1);

                if (args.length) {
                    return arguments.length
                        ? fn.apply(context, args.concat(slice.call(arguments)))
                        : fn.apply(context, args);
                } else {
                    return arguments.length
                        ? fn.apply(context, arguments)
                        : fn.call(context);
                }
            };
        };
    }
})();
