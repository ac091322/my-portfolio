(function ($) {
  var $toggle = $("#menu-toggle");
  var $menu = $("#menu");
  var $close = $("#menu-close");

  $toggle.on("click", function () {
    $menu.toggleClass("open");
  });

  $close.on("click", function () {
    $menu.removeClass("open");
  });

  // Close menu after click on smaller screens
  var resizeHandler = function () {
    if ($(window).width() < 846) {
      $(".main-menu a").off("click").on("click", function () {
        $menu.removeClass("open");
      });
    }
  };

  $(window).on("resize", resizeHandler);
  resizeHandler(); // Initial check

  $(".owl-carousel").owlCarousel({
    items: 4,
    lazyLoad: true,
    loop: true,
    dots: true,
    margin: 30,
    responsiveClass: true,
    responsive: {
      0: {
        items: 1
      },
      600: {
        items: 1
      },
      1000: {
        items: 4
      }
    }
  });

  $(".hover").on("mouseleave", function () {
    $(this).removeClass("hover");
  });

  $(".isotope-wrapper").each(function () {
    var $isotope = $(".isotope-box", this);
    var $filterCheckboxes = $('input[type="radio"]', this);

    var filter = function () {
      var type = $filterCheckboxes.filter(":checked").data("type") || "*";
      if (type !== "*") {
        type = '[data-type="' + type + '"]';
      }
      $isotope.isotope({ filter: type });
    };

    $isotope.isotope({
      itemSelector: ".isotope-item",
      layoutMode: "masonry"
    });

    $(this).on("change", filter);
    filter();
  });

  lightbox.option({
    resizeDuration: 200,
    wrapAround: true
  });
})(jQuery);
