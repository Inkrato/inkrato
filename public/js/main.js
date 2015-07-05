/**
 * main.js assumes the core libs (which should be present on page render), like
 * jQuery and Bootstrap.js, have been loaded already (in application.js)
 */
//= require jquery.timeago
//= require jquery.bootstrap-growl
//= require bootstrap.tags
//= require bootstrap.select
//= require bootstrap.typeahead
//= require form-validator
//= require jquery.peity
//= require jquery.mentionsInput.js
//= require jquery.elastic.js

$(function() { 
  
  // Handle modal & dropdown links for graceful no-js support
  $('a[data-toggle="modal"]').attr('href', "#");
  $('a[data-toggle="dropdown"]').attr('href', "#");
  
  // Make modal dialogs inside a modal-draggable class draggable
  $(".modal-draggable .modal-dialog").draggable({
      handle: ".modal-header"
  });
  
  // Process timeago and make timeago elements visible
  // NB: They are hidden on load if the html element has the class "js"
  $("time.timeago").timeago();
  $("time.timeago").css({ visibility: 'visible' });

  // Handle displaying flash alerts on a page as Growl style alerts on load
  $("#flash-messages .alert").each(function() {
    var type = 'info';
    if ($(this).hasClass('alert-success'))
      type = 'success';
    if ($(this).hasClass('alert-warning'))
      type = 'warning';
    if ($(this).hasClass('alert-danger'))
      type = 'danger';

    $.bootstrapGrowl( $(this).html(), {
      type: type,
      align: 'center',
      width: 'auto',
      allow_dismiss: false,
      offset: {
        from: "top",
        amount: $(".navbar").height() + $(".jumbotron-heading").height() + 20
      }
    });
  });
  
  // Handle keyboard shortcuts
  $(document).keyup(function(e) {
      // Ignore any shortcut keys if the Ctrl modifier key was depressed
      // e.g. So that the "C" key doesn't trigger a dialog when someone
      // uses "Ctrl+C" to copy text on the page!
      if (e.ctrlKey)
          return;

      if (e.keyCode === 27)// 27 = 'ESC' key
        return;

      // Check to see if an element has focus (if so, return)
      if ($("input:focus") != null && $("input:focus").length > 0)
          return;

      if ($("textarea:focus") != null && $("textarea:focus").length > 0)
          return;

      if ($("select:focus") != null && $("select:focus").length > 0)
          return;
      
      // Escape button behaviour
      if (e.keyCode === 67 || e.keyCode === 78) { // 67 = 'c' key, 78 = 'n' key
        $('*[data-shortcut-key="n"]')[0].click();
      } else if (e.keyCode === 69) { // The 'e' key (for edit).
        $('*[data-shortcut-key="e"]')[0].click();
      } else if (e.keyCode === 83) { // The 's' key (for search).
        $('#search').focus();
      } else if (e.keyCode === 80) { // The 'p' key (for profile).
        $('*[data-shortcut-key="p"]')[0].click();
      } else if (e.keyCode === 72) { // The 'h' key (for home).
        $('*[data-shortcut-key="h"]')[0].click();
      }
      
      return;
  });

  // Control for the typeahead input for the search box
  // @todo Hook into the render event to improve how results are displayed
  $('#search').typeahead({
    displayField: 'summary',
    valueField: 'url',
    onSelect: function(item) {
      window.location = item.value;
    },
    ajax: { 
      url: '/search',
      preDispatch: function(query) {
        return {
            q: query
        };
      },
      preProcess: function(data) {
        return data.posts;
      }
    }
  });
  
  // Shim to make any element with a valid "href" value clickable
  // (This exists under standards like XHTML 2.0 but not natively in browsers.)
  $("*[href]").bind('touch click', function() {
    if ($(this).attr('href') != "" && !$(this).attr('href').match(/^#/) && !$(this).attr('href').match(/^javascript:/) )
      window.location = $(this).attr('href');
  });
  
  // Make textarea's with the 'autoresize' class shink/grow based con content
  $('textarea.autoresize').elastic();
  // Trigger resizeable textarea elements inside modals when modals are shown
  $('.modal').on('shown.bs.modal', function() {
    $('textarea.autoresize', $(this)).elastic();
  });

  // @todo refactor out to seperate JS file
  // Make the entire form containing the voting buttons clickable for better UX
  $(document).on('submit', 'form.btn-vote', function(event) {
    // Prevent the form from submitting normally
    event.preventDefault();
    return false;
  });
  $("form[data-upvote]").bind('touch click', function() {
    upvote(this);
  });  
  $("form[data-downvote]").bind('touch click', function() {
    downvote(this);
  });
  
  // Using http://benpickles.github.io/peity/ for simple charts
  $(".donut span").peity("donut");
  $(".pie span").peity("pie");
});

function upvote(form) {
  var postId = $(form).attr('data-upvote');
  $.post(
    $(form).attr("action"),
    $(form).serialize(),
    function(response) {
      
      $('*[data-votes="'+postId+'"]').each(function() {
        var data = response.downvotes+","+response.upvotes;
        if (response.upvotes == 0 && response.downvotes == 0)
          data += ",1";
        $("span", this)
        .text(data)
        .change();
      });
      
      if ($(form).hasClass("btn-default")) {
        $('form[data-upvote="'+postId+'"]').each(function() {
          $(this).removeClass("btn-default").addClass("btn-success");
          $(".btn", this).removeClass("text-default").addClass("text-white");
          this.action = this.action.replace(/upvote/, 'unvote');
          
          // On upvote, set any "active" downvote buttons to a neutral state
          $('form[data-downvote="'+postId+'"]').each(function() {
            if (!$(this).hasClass("btn-default")) {
              $(this).removeClass("btn-danger").addClass("btn-default");
              $(".btn", this).removeClass("text-white").addClass("text-default");
              this.action = this.action.replace(/unvote/, 'downvote');
            };
          });
        });
      } else {
        $('form[data-upvote="'+postId+'"]').each(function() {
          $(this).removeClass("btn-success").addClass("btn-default");
          $(".btn", this).removeClass("text-white").addClass("text-default");
          this.action = this.action.replace(/unvote/, 'upvote');
        });
      }
      $('*[data-score="'+postId+'"]').each(function() {
        if (response.score > 0) {
          $(this).html('<span class="text-success"><strong>'+response.score+'</strong></span>');
        } else if (response.score < 0) {
          $(this).html('<span class="text-danger"><strong>'+response.score+'</strong></span>');
        } else {
          $(this).html('<span class="text-muted"><strong>'+response.score+'</strong></span>');
        }
      });
    }
  );
};

function downvote(form) {
  var postId = $(form).attr('data-downvote');
  $.post(
    $(form).attr("action"),
    $(form).serialize(),
    function(response) {
      
      $('*[data-votes="'+postId+'"]').each(function() {
        var data = response.downvotes+","+response.upvotes;
        if (response.upvotes == 0 && response.downvotes == 0)
          data += ",1";
        $("span", this)
        .text(data)
        .change();
      });

      if ($(form).hasClass("btn-default")) {
        $('form[data-downvote="'+postId+'"]').each(function() {
          $(this).removeClass("btn-default").addClass("btn-danger");
          $(".btn", this).removeClass("text-default").addClass("text-white");
          this.action = this.action.replace(/downvote/, 'unvote');
        });
        
        // On downvote, set any "active" upvote buttons to a neutral state
        $('form[data-upvote="'+postId+'"]').each(function() {
          if (!$(this).hasClass("btn-default")) {
            $(this).removeClass("btn-success").addClass("btn-default");
            $(".btn", this).removeClass("text-white").addClass("text-default");
            this.action = this.action.replace(/unvote/, 'upvote');
          }
        });
      } else {
        $('form[data-downvote="'+postId+'"]').each(function() {
          $(this).removeClass("btn-danger").addClass("btn-default");
          $(".btn", this).removeClass("text-white").addClass("text-default");
          this.action = this.action.replace(/unvote/, 'downvote');
        });
      }
      $('*[data-score="'+postId+'"]').each(function() {
        if (response.score > 0) {
          $(this).html('<span class="text-success"><strong>'+response.score+'</strong></span>');
        } else if (response.score < 0) {
          $(this).html('<span class="text-danger"><strong>'+response.score+'</strong></span>');
        } else {
          $(this).html('<span class="text-muted"><strong>'+response.score+'</strong></span>');
        }
      });
    }
  );
};

function checkIfAnyInputElementHasFocus() {
  var focusedInputs = $("input:focus");
  if (focusedInputs != null && focusedInputs.length > 0)
      return true;

  var focusedInputs = $("textarea:focus");
  if (focusedInputs != null && focusedInputs.length > 0)
      return true;

  var focusedInputs = $("select:focus");
  if (focusedInputs != null && focusedInputs.length > 0)
      return true;

  return false;
}

/**
 * Smart resize by Paul Irish
 * http://www.paulirish.com/2009/throttled-smartresize-jquery-event-handler/
 */
(function($,sr){
  var debounce = function (func, threshold, execAsap) {
      var timeout;
      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null;
          };

          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);

          timeout = setTimeout(delayed, threshold || 100);
      };
  }
  jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
})(jQuery,'smartresize');

// http://tanalin.com/en/articles/ie-version-js/
if ((document.all && !document.addEventListener))
  window.location.href = "/unsupported";

$(window).smartresize(function() {
  // Update charts in response to window resize events
  $(".donut span").change();
  $(".pie span").change();
});