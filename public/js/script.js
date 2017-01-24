$(document).ready(function() {


    $('#calendar').fullCalendar({
      fixedWeekCount: false,
      dayClick: function(date, jsEvent, view) {

            $('[name="start"]').val(date.format());
            // alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);

            // alert('Current view: ' + view.name);


      }
    });


// do this for all events in the db


      $('#addEventButton').click(function(e){
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
                url: "/event/"+response.event.last_id
              }], true);
          }
        });
      });

});
