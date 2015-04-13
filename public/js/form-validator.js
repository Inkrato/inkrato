/**
* Form field validator wrapper
*/
$(document).on('submit', 'form[data-validator="true"]', function(e) {

  // Go ahead and submit form if data-validated=true attribute already set
  if ($(this).attr('data-validated') == "true")
    return;
    
  e.preventDefault();
  
  // Disable the submit button while the form is being validated
  $('*[type="submit"]', this).addClass('disabled');
  
  var form = this;
  
  $.ajax({
    url: this.action,
    type: this.method,
    data: $(this).serialize(),
    dataType: 'json',
    headers: { 'X-Validate': 'true' },
    cache: false, // Append timestamp
    success: function(response) {
      
      // If no errors, then add data-validated=true attribute and perform submit
      if (!response.errors || response.errors.length == 0) {
        $(form).attr('data-validated', 'true');
        $('*[type="submit"]', form).removeClass('disabled');
        $(form).submit();
        return false;
      }
      
      // If therere are errors, then highlight the fields with errors.
      
      // Re-enable the submit button
      $('*[type="submit"]', form).removeClass('disabled');

      // Remove existing alerts/input feedback
      $(".messages", form).html('');
      $(".form-control-feedback", form).remove();
      $(".form-control-feedback-text", form).remove();
      
      for (var i = 0; i < response['errors'].length; i++) {
        var field = response['errors'][i]['param'];
        var msg = response['errors'][i]['msg'];
        
        // Find the field in the form with the error
        var target = null;
        if ($('*[name="'+field+'"]', form).is(":visible")) {
          target = $('*[name="'+field+'"]', form);
        } else if ($('*[name="'+field+'"]', form).is("select")) {
          // In the case of styled select elements (which are hidden),
          // choose the nearest "boostrap select" element.
          target = $('*[name="'+field+'"]', form).siblings('.bootstrap-select');
        }
        $(target).after('<i class="fa fa-lg fa-exclamation-circle form-control-feedback" aria-hidden="true"></i>');
        $(target).after('<small class="form-control-feedback-text text-danger">'+msg+'</small>');
        
        // Hide all currently visible alerts on the page (to avoid confusion)
        $(".alert").hide();
        
        // Add the error class to the target's container
        if (target != null) {
          target.parents(".form-group").addClass('has-error').addClass('has-feedback');
          //target.tooltip("destroy");
        }
      }
    },
    error: function() {
      // If validation fails, then set the data-validator attribute to false,
      // allowing the form to submit normally and the server to handle the error
      $(form).attr('data-validator', 'false');
      $('*[type="submit"]', form).removeClass('disabled');
      $(form).submit();
    }
  });
  
  return false;
});

// Remove .has-error class and tooltips from fields if they change/are focused
$(document).on('focus blur keydown change', '.form-group.has-error *', function() {
  $(this).parents(".form-group").removeClass("has-error").removeClass("has-feedback");
  $(".form-control-feedback", $(this).parents(".form-group")).remove();
  $(".form-control-feedback-text", $(this).parents(".form-group")).remove();
});
