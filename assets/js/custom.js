(function ($) {
  const $menuToggle = $("#menu-toggle");
  const $menu = $("#menu");
  const $menuClose = $("#menu-close");

  $menuToggle.on("click", function () {
    $menu.toggleClass("open");
  });

  $menuClose.on("click", function () {
    $menu.removeClass("open");
  });

  // Debounce function for resize event
  const debounce = function (func, wait) {
    let timeout;
    return function () {
      const context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    };
  };

  const resizeHandler = function () {
    if ($(window).width() < 846) {
      $(".main-menu a").off("click").on("click", function () {
        $menu.removeClass("open");
      });
    }
  };

  const debounceResizeHandler = debounce(resizeHandler, 100);
  $(window).on("resize", debounceResizeHandler);
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
    const $isotopeBox = $(".isotope-box", this);
    const $filterCheckboxes = $('input[type="radio"]', this);

    const filter = function () {
      let type = $filterCheckboxes.filter(":checked").data("type") || "*";
      if (type !== "*") {
        type = '[data-type="' + type + '"]';
      }
      $isotopeBox.isotope({ filter: type });
    };

    $isotopeBox.isotope({
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
