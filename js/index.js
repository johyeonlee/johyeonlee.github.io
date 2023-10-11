"use strict";

$(window).resize(function () {
  waitForFinalEvent(function(){
    bodyHeight = $('body').height();
    sliderHeight = $('.slider-navigation').height();
    elementHeight = $('section').height();
    sectionAmount = $('section').length;
    scale = (bodyHeight - (elementHeight)) / (sliderHeight - $('.nav-pointer').outerHeight() );

    updatePos();
  }, 500, "resizing");
});


$(window).resize(function(){
  
});

$(function() {
  $('a[href*=#]').on('click', function(e) {
    e.preventDefault();
    $('html, body').animate({ scrollTop: $($(this).attr('href')).offset().top}, 300, 'linear');
  });
});

// Global var to cache info about indicators for easy access. 
var indicators = [];

$(window).on("load", function() {

  //
  //	CREATE THE INDICATORS AND ADD TO PAGE
  //

  var rawIndicators = "";
  var $articles = $("article");
  // Create a bubble for each article
  $articles.each(function(i) {
    var iInverse = $articles.length - i - 1;
    // Top margin is a function of the nodes before it, bottom is proportional to those after. determines stacking at top / bottom static positions
    var margins = 'margin: ' + ((i*2.3)+1.5) + 'em 0 ' + ((iInverse*2.3)+1.5) + 'em 0;';
    rawIndicators +=  '<a class="indicator indicator--upcoming" style="' + margins + '" href="#' + this.id + '"><span class="indicator-tooltip">' + $(this).find("h2").text() + '</span></a>';
  });
  $("body").append(rawIndicators);

  // Utility function to calculate the proper top coordinate for a bubble when it's on the move (position: absolute)
  var getNodeTopPos = function(indicator, target) {
    var indMargTop = parseInt(indicator.css("margin-top").replace("px", ""));
    var targCenter = target.outerHeight(false)/2;
    var indCenter = indicator.outerHeight(false)/2;
    return target.offset().top - indMargTop + targCenter - indCenter;
  }


  // 
  // INITIAL SET UP OF INDICATOR OBJECT
  //

  var calcIndicatorInfo = function(){

    indicators = []
    $(".indicator").each(function(){
      
      var o = {
        $indicator: $(this),
        $target: $( $(this).attr("href") ),
        $targetTitle: $( $(this).attr("href") + " h2" )
      };

      // When it's abs positioned (on the move), this is the top pos
      o.absPos = getNodeTopPos(o.$indicator, o.$targetTitle); 

      // When it's abs positioned, at this scroll pos we should make the indicator fixed to the bottom
      o.absBottomStop = window.innerHeight - (o.absPos + o.$indicator.outerHeight(true));

      // Top / bottom stops for being 'viewable'
      o.viewableTopStop = o.$target.offset().top - window.innerHeight;
      o.viewableBottomStop = o.$target.offset().top + o.$target.outerHeight();
      indicators[indicators.length] = o;
      
    });
  };

  //
  // ON RESIZE FUNCTION - UPDATE THE CACHED POSITON VALUES
  //

  var initIndicators = function() {
    calcIndicatorInfo();
    // Bug fix - without timeout scroll top reports 0, even when it scrolls down the page to last page loaded position
    // http://stackoverflow.com/questions/16239520/chrome-remembers-scroll-position
    setTimeout(function(){
      var st = $(document).scrollTop();
      $(indicators).each(function(){
        if(st<=this.absPos && st>=(-1*this.absBottomStop))
          this.$indicator.removeClass("indicator--upcoming").removeClass("indicator--passed").addClass("indicator--active")
              .css({ "top" : this.absPos });
        else if(st>=(-1*this.absBottomStop)) 
          this.$indicator.removeClass("indicator--active").removeClass("indicator--upcoming").addClass("indicator--passed").css({ "top" : "" });
        else
          this.$indicator.removeClass("indicator--active").removeClass("indicator--passed").addClass("indicator--upcoming").css({ "top" : "" });
        
        if(st>=this.viewableTopStop && st<=(this.viewableBottomStop))
          this.$indicator.addClass("indicator--viewing");
        else
          this.$indicator.removeClass("indicator--viewing");
      });
    }, 0);
  }

  //
  // SCROLL FUNCTION - UPDATE ALL OF THE INDICATORS
  //

  var adjustIndicators = function() {
    var st = $(document).scrollTop();

    // The indicators that SHOULD be scrolling
    var anticipated = _.filter(indicators, function(o) { return (st<=o.absPos && st>=(-1*o.absBottomStop)) });

    // The $ elements that are indeed scrolling
    var active$ = $(".indicator--active");

    // Anything in anticipated that isn't in active should be activated ...
    var needsActivation = _.filter(anticipated, function(o) { return !_.contains(active$, o.$indicator[0]); })

    // ... And anything thats in active that isn't in anticipated needs to be stopped. 
    var anticipatedEls = _.pluck(anticipated, "$indicator");
    var needsDeactivation = _.filter(active$, function(o) { 
      return !_.find(anticipatedEls, function(e){ return e[0] == o }); 
    });

    // Do the Activation
    _.each(needsActivation, function(o) {
      o.$indicator
        .removeClass("indicator--upcoming").removeClass("indicator--passed")
        .addClass("indicator--active")
        .css({ "top" : o.absPos })
    });

    _.each(needsDeactivation, function(i$){
      var indicator = _.find(indicators, function(i) {
        return i.$indicator[0] == i$;
      });
      if(st>=indicator.absPos) {
        // Went off top. now passed. 
        indicator.$indicator.removeClass("indicator--active").addClass("indicator--passed").css({ "top" : "" });
      }
      else {
        // Went off bottom. now upcoming. 
        indicator.$indicator.removeClass("indicator--active").addClass("indicator--upcoming").css({ "top" : "" });
      }
    });

    $(indicators).each(function(){
      if(st>=this.viewableTopStop && st<=(this.viewableBottomStop))
        this.$indicator.addClass("indicator--viewing");
      else
        this.$indicator.removeClass("indicator--viewing");
    });

  }

  //
  // BIND EVENTS
  //

  $(document).scroll(function() {
    adjustIndicators();
  });
  $(window).resize(function() {
    initIndicators();
    adjustIndicators();
  });
  
  initIndicators();
  adjustIndicators();
  
  $(".indicator").click(function(){
    initIndicators();
    adjustIndicators();
  })

});

(function() {
  var floatingLabel;

  floatingLabel = class floatingLabel {
    constructor(form, options = {}) {
      var event, i, input, j, label, len, len1, ref, ref1;
      if (!form) {
        return;
      }
      options.focusClass || (options.focusClass = "focus");
      options.activeClass || (options.activeClass = "active");
      options.errorClass || (options.errorClass = "error");
      form.classList.add('has-floated-label');
      ref = form.querySelectorAll('label');
      for (i = 0, len = ref.length; i < len; i++) {
        label = ref[i];
        if (!(input = document.querySelector(`#${label.getAttribute('for')}`))) {
          return;
        }
        ref1 = ['keyup', 'input', 'change'];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          event = ref1[j];
          input.addEventListener(event, function() {
            this.parentNode.classList.remove(options.errorClass);
            return this.parentNode.classList.toggle(options.activeClass, !!this.value);
          });
        }
        input.addEventListener('focus', function() {
          return this.parentNode.classList.add(options.focusClass);
        });
        input.addEventListener('blur', function() {
          return this.parentNode.classList.remove(options.focusClass);
        });
        input.parentNode.classList.toggle(options.activeClass, !!input.value);
      }
    }

  };

  // initialize
  window.floatingLabel = new floatingLabel(document.querySelector('.form'));

}).call(this);
