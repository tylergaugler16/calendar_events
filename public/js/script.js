$(document).ready(function() {

// creates calendar

    $('#calendar').fullCalendar({
      fixedWeekCount: false,
      header: {
        left: 'title',
        center: 'identifier',
        right: 'month, basicWeek, week, prev, next'
      },
      views: {
        month: {
          eventLimit: 4
        },
        basicWeek: {

        }

      },
      dayClick: function(date, allDay, jsEvent, view) {

            $('[name="start"]').val(date.format());
            var day;
      },
      eventClick: function(calEvent, jsEvent, view) {
          console.log(calEvent);
          $('#modalTitle').html(calEvent.title);
          $('#modalDescription').html($.parseHTML(calEvent.description));
          $('#eventId').val(calEvent.id);
          var id = $('#eventId').val();
          $.ajax({
            url: '/event/comments',
            method: 'GET',
            data: {
              event_id: id
            },
            success: function(result){
              for(var i = result.comments.length-1;i >= 0;i--){
                $('<div class="comment"><div class="commentHeader"><div class="commentAuthor"><span>'+result.comments[i].name+'</span></div><div class="commentDate"><span>'+result.comments[i].date+'</span></div></div><div class="commentContent">'+result.comments[i].comment+'</div></div>').insertBefore('#addComment');
              }
              $('#modalDescription').css('display','block');
              $('#overlay, #modal, #eventComments').css('display','initial');
            }

          });
      },
      eventRender: function(event, element, view) {
          if(view.name === 'basicWeek') {
              $(element).css('padding','15px 2px');
          }
      }

    });

    $('.fc-left h2').after('<h3 id="calendar_identifier"></h3>');
    $('#calendar').after('<a href="#" id="deleteCalendar"></a>');

// display event Modal.. need to do click event this way b/c events are dynamically added
$('body').on('click','.fc-event',function(e){
  e.preventDefault();
});

$('#closeModal, #overlay').click(function(e){
  e.preventDefault();
  $('#overlay, #modal,#joinCalendarContainer,#modalDescription').css('display','none');
  $('#addComment').css('display','initial');
  $('#modalTitle').html('');
  $('.comment').remove(); //removes all comments
  $('#modal').css('height','80%');
});

$('#joinCalendar').click(function(e){
  e.preventDefault();
  $('#addComment').css('display','none');
  $('#joinCalendarContainer, #overlay, #modal').css('display','initial');
  $('#modal').css('height','40%');
});


// adds event to calendar
$('#addEventButton').click(function(e){
  console.log("i'm ading an event");

  e.preventDefault();
  var title = $('[name="title"]').val();
  var desc  = $.map($('[name="description"]').val().split("\n"), function(paragraph){
    return '<p>'+paragraph+'</p>';
  }).join('');
  var start = $('[name="start"]').val();
  var id    = $('.active :first-child')[0].id;
  console.log(id);
  $.ajax({
    url: '/addEvent',
    type: 'POST',
    data: {
      title: title,
      description: desc,
      start: start,
      calendar_id: id
    },
    success: function(response){

      console.log("added event");
      $('#calendar').fullCalendar('addEventSource', [
        {
          title: title,
          start: start,
          url: "#",
          id: response.event.last_id,
          description: desc
        }], true);
        $('html, body').animate({
          scrollTop: $("#calendar").offset().top
        }, 2000);
        $('[name="title"]').val('');
        $('[name="start"]').val('');
        $('[name="description"]').val('');
    }
  });
});

// adds a calendar
$('#addCalendarButton').click(function(e){

  e.preventDefault();
  var name     = $('[name="name"]').val();
  var user_id  = $('[name="user_id"]').val();
  var pass     = $('[name="password"]').val();
  if(name === ''){
    $('[name="name"]').focus(function(){
      $(this).css({
        'outline': 'none !important',
        'border':'1px solid red' ,
        'box-shadow': '0 0 10px'
      });
    });
    $('[name="name"]').focus();
    return false;
  }
  $.ajax({
    url: '/calendar/add',
    type: 'POST',
    data: {
      name: name,
      user_id: user_id,
    },
    success: function(response){
      console.log("added calendar");
      $('#calendar').fullCalendar('removeEvents');
      $('ul').find('.active').removeClass('active');
      $('[name="name"]').val('');
      $('[name="password"]').val('');
      $('#userCalendarList').append('<li class="active"><a href="#" class="calendar_options" identifier="'+ response.password+'"id="'+response.user_id+'">'+ name +'</a></li>');
      $('#userCalendarList').find('.active a').trigger('click');
        // $('.calendar_options :last-child').click();
    }
  });
});


//returns events and users belonging to a specific calendar
$('body').on('click', '.calendar_options', function(e){
  console.log("heereee");
    e.preventDefault();
    $('#calendar').fullCalendar('removeEvents');
    var active = $('li.active');
    $('ul').find('.active').removeClass('active');
    $(this).parent('li').addClass('active');
    var id = this.id;
    var pass = $(this).attr('identifier');
    var name = $(this).html();
    $.ajax({
        url: '/events',

        data: {
          calendar_id:  id,
          password:     pass,
          name:         name,
        },
        success: function(response){
          console.log("got calendar events!");
          for(var i=0;i<response.events.length;i++){
            $('#calendar').fullCalendar('addEventSource', [
              {
                title: response.events[i].title,
                start: response.events[i].start_date,
                id: response.events[i].id,
                url: '#',
                description: response.events[i].description
                // url: "/event/"+response.events[i].id
              }], true);
          }
          $('#calendarUsers ul').empty();
          for(var r =0;r<response.users.length;r++){
            $('#calendarUsers ul').append('<li>'+response.users[r].name+'</li>');
          }
          $('#calendar_identifier, #deleteCalendar').html('');
          $('#calendar_identifier').html('Invite Code: '+pass);
          $('#deleteCalendar').html('Delete Calendar: '+name);
          $('#deleteCalendar').attr('calendar_id',id);
        }
      });
  });



  $('#joinCalendarButton').click(function(e){
    e.preventDefault();
    var user_id  = $('[name="user_id"]').val();
    var pass     = $('[name="password"]').val();

    $.ajax({
      url: '/calendar/join',
      type: 'POST',
      data: {
        user_id: user_id,
        password: pass
      },
      success: function(response){
        $('#calendar').fullCalendar('removeEvents');
        console.log("joined calendar");
        $('ul').find('.active').removeClass('active');
        $('[name="name"]').val('');
        $('[name="password"]').val('');
        $('#userCalendarList').append('<li class="active"><a href="#" class="calendar_options" identifier="'+ pass+'"id="'+response.user_id+'">'+ response.name +'</a></li>');
        $('#closeModal').click();
        $('#userCalendarList').find('.active a').trigger('click');
      }
    });

  });

$('body').on('click','#deleteCalendar', function(e){
  e.preventDefault();
  if(confirm("Are you sure you want to delete your calendar? This calendar will be deleted for all users associated with this calendar ")){
    calendar_id = $(this).attr('calendar_id');
    $.ajax({
      url: '/calendar/delete',
      type: 'POST',
      data: {
        id: calendar_id
      },
      success: function(response){
        $('li.active a#'+calendar_id).parent().remove();
        $('#calendar').fullCalendar('removeEvents');
        console.log("DELETED CALENDAR");
      }
    });
  }

  // console.log(this.id);

});

$('#addCommentButton').click(function(e){
  e.preventDefault();
  var comment  = $.map($('[name="event_comment"]').val().split("\n"), function(paragraph){
    return '<p>'+paragraph+'</p>';
  }).join('');
  var user_id  = $('[name="user_id"]').val();
  var current_date = new Date();
  var date = current_date.toLocaleTimeString('en-GB', { hour: "numeric", minute: "numeric"})+ ' ' + current_date.toLocaleDateString();
  var event_id = $('[name="eventId"]').val();
  var name = $('#userInfo h1').html();
  $.ajax({
    url: '/event/comment/add',
    type: 'post',
    data: {
      comment: comment,
      user_id: user_id,
      date: date,
      event_id : event_id,
      name: name,
    },
    success: function(response){
      var $first = $('#eventComments div').first();
      $('<div class="comment"><div class="commentHeader"><div class="commentAuthor"><span>'+name+'</span></div><div class="commentDate"><span>'+date+'</span></div></div><div class="commentContent">'+comment+'</div></div>').insertBefore($first);
      $('[name="event_comment"]').val('');
      console.log("added comment");
    }

  });

});


});
