$(document).ready(function() {

// creates calender
// adds ajax call to dayClick functin to get weather for specific dayClick
// then makes ajax call to check if day has any events
// displays weather info and event info if they are available

    $('#calendar').fullCalendar({
      fixedWeekCount: false,
      dayClick: function(date, allDay, jsEvent, view) {

            $('[name="start"]').val(date.format());
            var day;
            // Modal.open({
            //          content: '<h1>'+title+ '</h1><p>'+description+'</p>',
            //          width: '50%',
            //          height: '60%',
            //          hideclose: true
            //        });

      }
    });



// adds event to calendar
$('#addEventButton').click(function(e){
  console.log("i'm ading an event");

  e.preventDefault();
  var title = $('[name="title"]').val();
  var desc  = $('[name="description"]').val();
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

      console.log("successful transaction");
      console.log(title+start);
      $('#calendar').fullCalendar('addEventSource', [
        {
          title: title,
          start: start,
          url: "/event/"+response.event.last_id,
          id: response.event.last_id
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
  console.log("i'm ading a calendar");

  e.preventDefault();
  var name     = $('[name="name"]').val();
  var user_id  = $('[name="user_id"]').val();
  var pass     = $('[name="password"]').val();
  $.ajax({
    url: '/calendar/add',
    type: 'POST',
    data: {
      name: name,
      user_id: user_id,
    },
    success: function(response){
      console.log("added calendar");
      $('ul').find('.active').removeClass('active');
        $('[name="name"]').val('');
        $('[name="password"]').val('');
        $('#userCalendarList').append('<li class="active"><a href="#" class="calendar_options" identifier="'+ response.password+'"id="'+response.user_id+'">'+ name +'</a></li>');
        // $('.calendar_options :last-child').click();
    }
  });
});


//returns events and users belonging to a specific calendar
$('.calendar_options').click(function(e){
    console.log("yeet");
    e.preventDefault();
    $('#calendar').fullCalendar('removeEvents');
    var active = $('li.active');
    $('ul').find('.active').removeClass('active');
    $(this).parent('li').addClass('active');
    var id = this.id;
    var pass = $(this).attr('identifier');
    console.log(pass);
    var name = $(this).html();
    console.log(name);
    $.ajax({
        url: '/events',

        data: {
          calendar_id:  id,
          password:     pass,
          name:         name,
        },
        success: function(response){
          console.log(response.events);
          console.log(response.users);
          for(var i=0;i<response.events.length;i++){
            $('#calendar').fullCalendar('addEventSource', [
              {
                title: response.events[i].title,
                start: response.events[i].start_date,
                url: "/event/"+response.events[i].id
              }], true);
          }
          $('#calendarUsers ul').empty();
          for(var r =0;r<response.users.length;r++){
            $('#calendarUsers ul').append('<li>'+response.users[r].username+'</li>');
          }
        }
      });
  });
  $('#joinCalendar').click(function(e){
    Modal.open({
                        content: '<div id="joinCalendarModal"><h3>Calendar Invite Code</h3><form action=""> <input type="text" name="password" value=""><input type="hidden" name="user_id" value="<%= user.id %>"><input type="submit" name="" id="joinCalendarButton" value="Join"></form></div> ',
                        width: '40%',
                        height: '20%',
                        hideclose: true
                       });
  });

  $('#joinCalendarButton').click(function(e){
    console.log("yeer");
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
        console.log(response);
        console.log("added calendar");
        $('ul').find('.active').removeClass('active');
          $('[name="name"]').val('');
          $('[name="password"]').val('');
          $('#userCalendarList').append('<li class="active"><a href="#" class="calendar_options" identifier="'+ pass+'"id="'+user_id+'">'+ response.name +'</a></li>');

      }
    });

  });


});
