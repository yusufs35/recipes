(function(){
     var myCarousel = document.getElementById('carouselExampleIndicators');
     if(myCarousel){
          myCarousel.addEventListener('slide.bs.carousel', function (e) {
               document.querySelectorAll('.carousel-indicators a').forEach(function(item){
                    item.classList.remove('active');
               });
               document.querySelector('.carousel-indicators a[data-bs-slide-to="' + e.to + '"]').classList.add('active');
          });
     }

     var rates = document.getElementById('set-rate');
     if(rates){
          rates = rates.querySelectorAll('i');
          rates.forEach(function(item){
               console.log(item);
               item.addEventListener('click', function(e){
                    resetStar();
                    console.log(e.target);
                    var rate = e.target.dataset.rate;
                    setStar(rate);      
                    document.getElementById('hdnRate').value=rate;              
               });
          })

          function resetStar(){
               rates.forEach(function(item){
                    item.classList.replace('text-warning','text-secondary');
               });
          }

          function setStar(index){
               rates.forEach(function(item){
                    var rate = item.dataset.rate;
                    if(index >= rate){
                         item.classList.replace('text-secondary', 'text-warning');
                    }
                    
               });
          }
     }


     



})();