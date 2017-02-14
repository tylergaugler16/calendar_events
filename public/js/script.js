$(document).ready(function() {

  //ajax call to get weather of next 15 days
  // store the result in global array weatherDates[]
  // $.ajax({
  //   type:'get',
  //   dataType: 'jsonp',
  //   url: 'https://api.wunderground.com/api/da29124d0e38bc6b/forecast10day/q/NY/New_York.json',
  //
  //   success: function(result){
  //       weatherDates = result.forecast.simpleforecast.forecastday;
  //       var day = $('#calendar').fullCalendar('getDate'); //returns current date
  //
  //       for(var i= 0;i < result.forecast.simpleforecast.forecastday.length;i++){
  //         m = day._d.getMonth()+1;
  //         if(m < 10) m = "0"+m;
  //         d = day._d.getDate();
  //         if(d<10) d = "0"+d;
  //         var dateString = +day._d.getUTCFullYear() +"-"+m+"-"+d;
  //
  //         result.forecast.simpleforecast.forecastday[i].date = dateString; // adds date to the returned object
  //         $('#calendar').fullCalendar( 'incrementDate', {days: 1} ); // increments date and then gets value
  //         day = $('#calendar').fullCalendar('getDate');
  //
  //       }
  //       //returns day back to current day
  //       $('#calendar').fullCalendar('today');
  //     }
  // });


// creates calender
// adds ajax call to dayClick functin to get weather for specific dayClick
// then makes ajax call to check if day has any events
// displays weather info and event info if they are available

    $('#calendar').fullCalendar({
      fixedWeekCount: false,
      dayClick: function(date, allDay, jsEvent, view) {

            $('[name="start"]').val(date.format());
            var day;


            // var weatherInfo = {
            //   'max_temp': 'Not Available',
            //   'min_temp': 'Not Available',
            //   'icon_url': '#',
            //   'description': '',
            //   'date': date.format()
            // };
            // if(weatherDates.length > 0){
            //   // if there are forcasts, find the forecast for the selected date
            //   for(var i=0;i<weatherDates.length;i++){
            //     if(weatherDates[i].date == date.format()){
            //       weatherInfo = {
            //         'max_temp': weatherDates[i].high.fahrenheit || 'Not Available',
            //         'min_temp': weatherDates[i].low.fahrenheit  || 'Not Available',
            //         'icon_url': weatherDates[i].icon_url  || 'Not Available',
            //         'description': weatherDates[i].conditions || '',
            //         'date': date.format()
            //       };
            //     }
            //   }
            // }
            // else{
            //
            //
            // }
            //
            // // console.log(date);
            // // send ajax request to see if day has event scheduled
            // // then opens modal with event info
            // $.ajax({
            //   url: '/events/'+date.format(),
            //   user_id: $('[name="id"]').val(),
            //   success: function(response){
            //     if(response.events.length > 0){
            //         var title= response.events[0].title;
            //         var description = response.events[0].description;
            //         Modal.open({
            //             content: '<h1>'+title+ '</h1><p>'+description+'</p>'+'<h3>High:</h3><span>'+weatherInfo.max_temp+'F</span><h3>Low:</h3><span>'+weatherInfo.min_temp+'F</span><h3><p>'+weatherInfo.description+'</p><h3 id="modalDate">'+weatherInfo.date+'</h3><img src="'+weatherInfo.icon_url+'"">',
            //             width: '50%',
            //             height: '60%',
            //             hideclose: true
            //           });
            //     }
            //     // if there is no event for that day, just dipslay the weather for that day if possible
            //     else{
            //         Modal.open({
            //             content: '<h1>No Event Scheduled for This Date</h1>'+'<h3>High:</h3><span>'+weatherInfo.max_temp+'F</span><h3>Low:</h3><span>'+weatherInfo.min_temp+'F</span><p>'+weatherInfo.description+'</p><h3 id="modalDate">'+weatherInfo.date+'</h3><img src="'+weatherInfo.icon_url+'""><a href="#"><div id="addEventModal">Add an Event to this day</div></a>',
            //             width: '50%',
            //             height: '60%',
            //             hideclose: true,
            //             openCallback: function(){
            //                       $('#addEventModal').click(function(){
            //                         $('#modal-overlay').css("visibility","hidden");
            //                         $('#modal-container').css("visibility","hidden");
            //                         $('html, body').animate({
            //                           scrollTop: $("#addEventButton").offset().top
            //                         }, 2000);
            //                       });
            //             }
            //           });
            //       }
            //   }
            //
            // });

      }
    });


// adds events to calendar from db
    // $.ajax({
    //   url: '/events',
    //
    //   data: {
    //
    //   },
    //   success: function(response){
    //     for(var i=0;i<response.events.length;i++){
    //       $('#calendar').fullCalendar('addEventSource', [
    //         {
    //           title: response.events[i].title,
    //           start: response.events[i].start_date,
    //           url: "/event/"+response.events[i].id
    //         }], true);
    //     }
    //   }
    // });


// do this for all events in the db

$('#addEventButton').click(function(e){
  console.log("i'm ading an event");

  e.preventDefault();
  var title = $('[name="title"]').val();
  var desc  = $('[name="description"]').val();
  var start = $('[name="start"]').val();
  var id    = $('.active')[0].id;
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
      password: pass
    },
    success: function(response){
      console.log("added calendar");
      $('ul').find('.active').removeClass('active');
        $('[name="name"]').val('');
        $('[name="user_id"]').val('');
        $('[name="password"]').val('');
        $('#userCalendarList').append('<li><a href="#" class="calendar_options active" id="'+response.user_id+'">'+ name +'</a></li>');
    }
  });
});


$('.calendar_options').click(function(e){
  e.preventDefault();
  $('#calendar').fullCalendar('removeEvents');
  var active = $('li.active');
  $('ul').find('.active').removeClass('active');
  $(this).addClass('active');
  var id = this.id;
  var pass = this.password;
  var name = $(this).val();
  console.log(id);
  $.ajax({
    url: '/events',

    data: {
      calendar_id:  id,
      password:     'foobar',
      name:         'Youth Group'
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
      for(var r =0;r<response.users.length;r++){
        $('#calendarUsers ul').append('<li>'+response.users[r].username+'</li>');
      }

    }
  });

});



});
