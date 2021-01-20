(function(){
     var myCarousel = document.getElementById('carouselExampleIndicators');
     myCarousel.addEventListener('slide.bs.carousel', function (e) {
          document.querySelectorAll('.carousel-indicators a').forEach(function(item){
               item.classList.remove('active');
          });
          document.querySelector('.carousel-indicators a[data-bs-slide-to="' + e.to + '"]').classList.add('active');
     });

     
})();