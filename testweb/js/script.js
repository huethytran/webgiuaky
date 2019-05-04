// owl carousel
  $(document).ready(function() {
    $("#myowl").owlCarousel({
      loop:false,
      margin:10,
      nav:false,
      responsive:{
        0:{
            items:1,
        },
        600:{
            items:2,
        }
    }
    });
    var owl = $('.owl-carousel');
    // Custom Button
    $('.customNextBtn').click(function() {
      owl.trigger('next.owl.carousel');
    });
    $('.customPrevBtn').click(function() {
      owl.trigger('prev.owl.carousel');
    });
  });
  $('.dropdown-item').hover(function() {
    $(this).parent().siblings('a').color="red";
  });

  //play video
  $(document).ready(function() {

    // Gets the video src from the data-src on each button
    var $videoSrc;  
    $('.video-btn').click(function() {
        $videoSrc = $(this).data( "src" );
    });
    console.log($videoSrc);
      
    // when the modal is opened autoplay it  
    $('#myModal').on('shown.bs.modal', function (e) {
        
    // set the video src to autoplay and not to show related video. Youtube related video is like a box of chocolates... you never know what you're gonna get
    $("#video").attr('src',$videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0" ); 
    })
       
    // stop playing the youtube video when I close the modal
    $('#myModal').on('hide.bs.modal', function (e) {
        // a poor man's stop video
        $("#video").attr('src',$videoSrc); 
    }) 
    });

    //rating star
    function onload(event) {
   
      var myDataService =  {
        rate:function(rating) {
           return {then:function (callback) {
             setTimeout(function () {
               callback((Math.random() * 5)); 
             }, 1000); 
           }
         }
       }
     }
   
     var starRating1 = raterJs( {
       starSize:32, 
       element:document.querySelector("#rater"), 
       rateCallback:function rateCallback(rating, done) {
         this.setRating(rating); 
         done(); 
       }
     });
    }

    window.addEventListener("load", onload, false); 

 
    $(document).ready(function() {
    var $TABLE = $('#table');
var $BUTTON = $('#export-btn');
var $EXPORT = $('#export');

$('.table-add').click(function () {
  var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide');
  $TABLE.find('table').append($clone);
});

$('.table-remove').click(function () {
  $(this).parents('tr').detach();
});

$('.table-up').click(function () {
  var $row = $(this).parents('tr');
  if ($row.index() === 1) return; // Don't go above the header
  $row.prev().before($row.get(0));
});

$('.table-down').click(function () {
  var $row = $(this).parents('tr');
  $row.next().after($row.get(0));
});

// A few jQuery helpers for exporting only
jQuery.fn.pop = [].pop;
jQuery.fn.shift = [].shift;

$BTN.click(function () {
  var $rows = $TABLE.find('tr:not(:hidden)');
  var headers = [];
  var data = [];
  
  // Get the headers (add special header logic here)
  $($rows.shift()).find('th:not(:empty)').each(function () {
    headers.push($(this).text().toLowerCase());
  });
  
  // Turn all existing rows into a loopable array
  $rows.each(function () {
    var $td = $(this).find('td');
    var h = {};
    
    // Use the headers from earlier to name our hash keys
    headers.forEach(function (header, i) {
      h[header] = $td.eq(i).text();   
    });
    
    data.push(h);
  });
  
  // Output the result
  $EXPORT.text(JSON.stringify(data));
});
    });