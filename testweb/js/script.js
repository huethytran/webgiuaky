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