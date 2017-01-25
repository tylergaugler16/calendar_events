$(document).ready(function() {



    $('#calendar').fullCalendar({
      fixedWeekCount: false,
      dayClick: function(date, allDay, jsEvent, view) {

            $('[name="start"]').val(date.format());

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
                      content: '<h1>'+title+ '</h1><p>'+description+'</p>',
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


      $('#findWeatherButton').click(function(e){
        e.preventDefault();
        var city = $('[name="city"]').val();
        $.ajax({
          url: 'http://api.openweathermap.org/data/2.5/forecast/daily',
          data: {
            APPID: 'beaace900c34ef2575c7c9a2fa4f8785',
            q: 'new york',
            mode: 'json',
            cnt: '15',
            units: 'imperial'
          },
          success: function(result){
            console.log(result.list[0]);


            // $('.fc-today').append(result.list[0].rain);
            var day = $('#calendar').fullCalendar('getDate');
            for(var i= 0;i<result.list.length;i++){
              m = day._d.getMonth()+1;
              if(m < 10) m = "0"+m;
              d = day._d.getDate();
              if(d<10) d = "0"+d;
              var dateString = +day._d.getUTCFullYear() +"-"+m+"-"+d;
              console.log(dateString);
              $('[data-date="'+dateString+'"]').append("yeet");
              // $('.fc-today').append(result.list[i].rain);
              $('#calendar').fullCalendar( 'incrementDate', {days: 1} );
              day = $('#calendar').fullCalendar('getDate');

            }

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
