/**
 * getSize plugin
 * This plugin can be used to get the width and height from hidden elements in the DOM.
 * It can be used on a jQuery element and will retun an object containing the width
 * and height of that element.
 *
 * Discussed at StackOverflow:
 * http://stackoverflow.com/a/8839261/1146033
 *
 * @author Robin van Baalen <robin@neverwoods.com>
 * @version 1.1
 * 
 * CHANGELOG
 *  1.0 - Initial release
 *  1.1 - Completely revamped internal logic to be compatible with javascript-intense environments
 *
 * @return {object} The returned object is a native javascript object
 *                  (not jQuery, and therefore not chainable!!) that
 *                  contains the width and height of the given element.
 */
$.fn.getSize = function() {    
    var $wrap = $("<div />").appendTo($("body"));
    $wrap.css({
        "position":   "absolute !important",
        "visibility": "hidden !important",
        "display":    "block !important"
    });

    $clone = $(this).clone().appendTo($wrap);

    sizes = {
        "width": this.width(),
        "height": this.height()
    };

    $wrap.remove();

    return sizes;
};