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
        amount: $(".navbar").height() + 10
      }
    });
  });
  
  
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
          // @todo call .focus() on search input
      } else if (e.keyCode === 80) { // The 'p' key (for profile).
        $('*[data-shortcut-key="p"]')[0].click();
      } else if (e.keyCode === 72) { // The 'h' key (for home).
        $('*[data-shortcut-key="h"]')[0].click();
      }
      
      return;
  });

  $('#search').typeahead({
    displayField: 'title',
    valueField: 'url',
    onSelect: function(item) {
      window.location = item.value;
    },
    ajax: { 
      url: '/posts/search',
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
      
      /*
  $('#search').typeahead({
    source: function (query, process, foo) {
      var typeahead = this;
      typeahead.render = function (options) {
        console.log("options MOFO");
        console.log(options);
      };
      return $.get('/posts/search?q='+query, function(data) {
        return process(data);
      });
    }
  });
      */
});


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