$(document).ready(function() {



  city = $('[name="city"]').val() || 'new york';
  //ajax call to get weather of next 15 days
  // store the result in global array weatherDates[]
  $.ajax({
    type:'get',
    dataType: 'jsonp',
    url: 'https://api.wunderground.com/api/da29124d0e38bc6b/forecast10day/q/NY/New_York.json',

    success: function(result){
      console.log(result.forecast.simpleforecast.forecastday.length);
      // console.log(result.forecast.simpleforecast.forecastday);
      weatherDates = result.forecast.simpleforecast.forecastday;
      console.log("TYLER");
      console.log(weatherDates);
      // console.log(result.list[0]);
      // $('.fc-today').append(result.list[0].rain);
      var day = $('#calendar').fullCalendar('getDate');
      for(var i= 0;i < result.forecast.simpleforecast.forecastday.length;i++){
        m = day._d.getMonth()+1;
        if(m < 10) m = "0"+m;
        d = day._d.getDate();
        if(d<10) d = "0"+d;
        var dateString = +day._d.getUTCFullYear() +"-"+m+"-"+d;
        // adds date to the returned object
        result.forecast.simpleforecast.forecastday[i].date = dateString;
        // $('[data-date="'+dateString+'"]').append("yeet");
        // $('.fc-today').append(result.list[i].rain);
        $('#calendar').fullCalendar( 'incrementDate', {days: 1} );
        day = $('#calendar').fullCalendar('getDate');

      }
      //returns day back to current day
      $('#calendar').fullCalendar('today');

    }
  });


// creates calender
// adds ajax call to dayClick functin to get weather for specific dayClick
// then makes ajax call to check if day has any events
// displays weather info and event info if they are available

    $('#calendar').fullCalendar({
      fixedWeekCount: false,
      dayClick: function(date, allDay, jsEvent, view) {

            $('[name="start"]').val(date.format());
            var day;


            var weatherInfo = {
              'max_temp': 'Not Available',
              'min_temp': 'Not Available',
              'icon_url': '#',
              'description': '',
              'date': date.format()
            };
            if(weatherDates.length > 0){
              // if there are forcasts, find the forecast for the selected date
              for(var i=0;i<weatherDates.length;i++){
                if(weatherDates[i].date == date.format()){
                  weatherInfo = {
                    'max_temp': weatherDates[i].high.fahrenheit || 'Not Available',
                    'min_temp': weatherDates[i].low.fahrenheit  || 'Not Available',
                    'icon_url': weatherDates[i].icon_url  || 'Not Available',
                    'description': weatherDates[i].conditions || '',
                    'date': date.format()
                  };
                }
              }
            }
            else{


            }

            // console.log(date);
            // send ajax request to see if day has event scheduled
            // then opens modal with event info
            $.ajax({
              url: '/events/'+date.format(),
              success: function(response){
                if(response.events.length > 0){
                  console.log("yeet");
                  var title= response.events[0].title;
                  var description = response.events[0].description;
                  Modal.open({
                      content: '<h1>'+title+ '</h1><p>'+description+'</p>'+'<h3>High:</h3><span>'+weatherInfo.max_temp+'F</span><h3>Low:</h3><span>'+weatherInfo.min_temp+'F</span><h3><p>'+weatherInfo.description+'</p><h3 id="modalDate">'+weatherInfo.date+'</h3><img src="'+weatherInfo.icon_url+'"">',
                      width: '50%', // Can be set to px, em, %, or whatever else is out there.
                      height: '60%',
                      hideclose: true, // Hides the close-modal graphic
                      // closeAfter: 10
                    });
                }
                // if there is no event for that day, just dipslay the weather for that day if possible
                else{
                  Modal.open({
                      content: '<h1>No Event Scheduled for This Date</h1>'+'<h3>High:</h3><span>'+weatherInfo.max_temp+'F</span><h3>Low:</h3><span>'+weatherInfo.min_temp+'F</span><p>'+weatherInfo.description+'</p><h3 id="modalDate">'+weatherInfo.date+'</h3><img src="'+weatherInfo.icon_url+'"">',
                      width: '50%', // Can be set to px, em, %, or whatever else is out there.
                      height: '60%',
                      hideclose: true, // Hides the close-modal graphic
                      // closeAfter: 10
                    });

                }
              }

            });
            // alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);

            // alert('Current view: ' + view.name);
      }
    });
    // check if this day has an event before



// adds events to calendar from db
    $.ajax({
      url: '/events',
      data: {

      },
      success: function(response){
        for(var i=0;i<response.events.length;i++){
          $('#calendar').fullCalendar('addEventSource', [
            {
              title: response.events[i].title,
              start: response.events[i].start_date,
              url: "/event/"+response.events[i].id
            }], true);
        }
      }
    });

    // $('#my-button').click(function() {
    //     var moment = $('#calendar').fullCalendar('getDate');
    //     alert("The current date of the calendar is " + moment.format());
    //
    //     $('#calendar').fullCalendar( 'incrementDate', {days: 1} );
    // });
    // use this to increment the calnder

// do this for all events in the db

$('#addEventButton').click(function(e){
  console.log("i'm ading an event");
  e.preventDefault();
  var title = $('[name="title"]').val();
  var desc  = $('[name="description"]').val();
  var start = $('[name="start"]').val();
  $.ajax({
    url: '/addEvent',
    type: 'POST',
    data: {
      title: title,
      description: desc,
      start: start,
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
    }
  });
});




      $('#modal').click(function(){
        Modal.open({
            content: 'd',
            width: '50%', // Can be set to px, em, %, or whatever else is out there.
            height: '60%',
            hideclose: true, // Hides the close-modal graphic
            // closeAfter: 10
          });
      });

});
