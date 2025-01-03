(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    root.lightbox = factory(root.jQuery);
  }
}(this, function ($) {
  function Lightbox(options) {
    this.album = [];
    this.currentImageIndex = undefined;
    this.options = $.extend({}, this.constructor.defaults);
    this.option(options);
    this.init();
  }

  Lightbox.defaults = {
    albumLabel: 'Image %1 of %2',
    alwaysShowNavOnTouchDevices: false,
    fadeDuration: 600,
    fitImagesInViewport: true,
    imageFadeDuration: 600,
    positionFromTop: 50,
    resizeDuration: 700,
    showImageNumberLabel: true,
    wrapAround: false,
    disableScrolling: false,
    sanitizeTitle: false
  };

  Lightbox.prototype.option = function (options) {
    $.extend(this.options, options);
  };

  Lightbox.prototype.imageCountLabel = function (currentImageNum, totalImages) {
    return this.options.albumLabel.replace(/%1/g, currentImageNum).replace(/%2/g, totalImages);
  };

  Lightbox.prototype.init = function () {
    $(document).ready(() => {
      this.enable();
      this.build();
    });
  };

  Lightbox.prototype.enable = function () {
    $('body').on('click', 'a[rel^=lightbox], area[rel^=lightbox], a[data-lightbox], area[data-lightbox]', (event) => {
      this.start($(event.currentTarget));
      return false;
    });
  };

  Lightbox.prototype.build = function () {
    if ($('#lightbox').length) return;

    const lightboxHTML = `
      <div id="lightboxOverlay" class="lightboxOverlay"></div>
      <div id="lightbox" class="lightbox">
        <div class="lb-outerContainer">
          <div class="lb-container">
            <img class="lb-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" />
            <div class="lb-nav">
              <a class="lb-prev"></a>
              <a class="lb-next"></a>
            </div>
            <div class="lb-loader">
              <a class="lb-cancel"></a>
            </div>
          </div>
        </div>
        <div class="lb-dataContainer">
          <div class="lb-data">
            <div class="lb-details">
              <span class="lb-caption"></span>
              <span class="lb-number"></span>
            </div>
            <div class="lb-closeContainer">
              <a class="lb-close"></a>
            </div>
          </div>
        </div>
      </div>
    `;
    $(lightboxHTML).appendTo($('body'));

    this.cacheElements();
    this.attachEventHandlers();
  };

  Lightbox.prototype.cacheElements = function () {
    this.$lightbox = $('#lightbox');
    this.$overlay = $('#lightboxOverlay');
    this.$outerContainer = this.$lightbox.find('.lb-outerContainer');
    this.$container = this.$lightbox.find('.lb-container');
    this.$image = this.$lightbox.find('.lb-image');
    this.$nav = this.$lightbox.find('.lb-nav');

    this.containerPadding = this.getCssPadding(this.$container);
    this.imageBorderWidth = this.getCssPadding(this.$image);
  };

  Lightbox.prototype.getCssPadding = function ($element) {
    return {
      top: parseInt($element.css('padding-top'), 10),
      right: parseInt($element.css('padding-right'), 10),
      bottom: parseInt($element.css('padding-bottom'), 10),
      left: parseInt($element.css('padding-left'), 10)
    };
  };

  Lightbox.prototype.attachEventHandlers = function () {
    this.$overlay.hide().on('click', () => this.end());
    this.$lightbox.hide().on('click', (event) => {
      if ($(event.target).is('#lightbox')) this.end();
    });

    this.$outerContainer.on('click', (event) => {
      if ($(event.target).is('#lightbox')) this.end();
    });

    this.$lightbox.find('.lb-prev').on('click', () => this.changeImage(this.currentImageIndex === 0 ? this.album.length - 1 : this.currentImageIndex - 1));
    this.$lightbox.find('.lb-next').on('click', () => this.changeImage(this.currentImageIndex === this.album.length - 1 ? 0 : this.currentImageIndex + 1));

    this.$lightbox.find('.lb-loader, .lb-close').on('click', () => this.end());
  };

  Lightbox.prototype.start = function ($link) {
    const $window = $(window);

    $window.on('resize', this.sizeOverlay.bind(this));

    $('select, object, embed').css({ visibility: 'hidden' });
    this.sizeOverlay();

    this.album = [];
    let imageNumber = 0;

    const addToAlbum = ($link) => {
      this.album.push({
        alt: $link.attr('data-alt'),
        link: $link.attr('href'),
        title: $link.attr('data-title') || $link.attr('title')
      });
    };

    const dataLightboxValue = $link.attr('data-lightbox');
    let $links;

    if (dataLightboxValue) {
      $links = $($link.prop('tagName') + '[data-lightbox="' + dataLightboxValue + '"]');
      $links.each((i, link) => {
        addToAlbum($(link));
        if (link === $link[0]) imageNumber = i;
      });
    } else {
      if ($link.attr('rel') === 'lightbox') {
        addToAlbum($link);
      } else {
        $links = $($link.prop('tagName') + '[rel="' + $link.attr('rel') + '"]');
        $links.each((i, link) => {
          addToAlbum($(link));
          if (link === $link[0]) imageNumber = i;
        });
      }
    }

    this.positionLightbox();
    this.changeImage(imageNumber);
  };

  Lightbox.prototype.positionLightbox = function () {
    const top = $(window).scrollTop() + this.options.positionFromTop;
    const left = $(window).scrollLeft();
    this.$lightbox.css({ top: top + 'px', left: left + 'px' }).fadeIn(this.options.fadeDuration);

    if (this.options.disableScrolling) {
      $('html').addClass('lb-disable-scrolling');
    }
  };

  Lightbox.prototype.changeImage = function (imageNumber) {
    this.disableKeyboardNav();
    const $image = this.$lightbox.find('.lb-image');
    this.$overlay.fadeIn(this.options.fadeDuration);

    $('.lb-loader').fadeIn('slow');
    this.$lightbox.find('.lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption').hide();

    this.$outerContainer.addClass('animating');
    const preloader = new Image();

    preloader.onload = () => {
      this.updateImage(preloader, imageNumber);
    };

    preloader.src = this.album[imageNumber].link;
    this.currentImageIndex = imageNumber;
  };

  Lightbox.prototype.updateImage = function (preloader, imageNumber) {
    const $image = this.$lightbox.find('.lb-image');
    const maxDimensions = this.calculateMaxDimensions();

    $image.attr({
      alt: this.album[imageNumber].alt,
      src: this.album[imageNumber].link
    });

    let imageWidth = preloader.width;
    let imageHeight = preloader.height;

    if (this.options.fitImagesInViewport) {
      ({ imageWidth, imageHeight } = this.fitImageToViewport(preloader, maxDimensions, imageWidth, imageHeight));
    }

    this.sizeContainer(imageWidth, imageHeight);
  };

  Lightbox.prototype.fitImageToViewport = function (preloader, maxDimensions, imageWidth, imageHeight) {
    if (imageWidth > maxDimensions.width) {
      imageHeight = Math.round(imageHeight * maxDimensions.width / imageWidth);
      imageWidth = maxDimensions.width;
    }
    if (imageHeight > maxDimensions.height) {
      imageWidth = Math.round(imageWidth * maxDimensions.height / imageHeight);
      imageHeight = maxDimensions.height;
    }
    return { imageWidth, imageHeight };
  };

  Lightbox.prototype.sizeContainer = function (imageWidth, imageHeight) {
    const $image = this.$lightbox.find('.lb-image');
    const sizeImage = this.calculateImageSize(imageWidth, imageHeight);

    this.$container.animate({
      width: sizeImage.width,
      height: sizeImage.height
    }, this.options.resizeDuration, 'swing');

    this.showImage();
  };

  Lightbox.prototype.calculateMaxDimensions = function () {
    const $window = $(window);
    return {
      width: $window.width() - this.containerPadding.left - this.containerPadding.right - 20,
      height: $window.height() - this.containerPadding.top - this.containerPadding.bottom - 120
    };
  };

  Lightbox.prototype.showImage = function () {
    this.$lightbox.find('.lb-image').fadeIn(this.options.imageFadeDuration);
    this.updateDetails();
  };

  Lightbox.prototype.updateDetails = function () {
    this.updateCaption();
    this.updateNav();
    this.updateLabel();
  };

  Lightbox.prototype.updateCaption = function () {
    if (this.album[this.currentImageIndex].title) {
      this.$lightbox.find('.lb-caption').html(this.album[this.currentImageIndex].title).fadeIn('fast');
    }
  };

  Lightbox.prototype.updateNav = function () {
    const totalImages = this.album.length;
    const currentImageNumber = this.currentImageIndex + 1;

    this.$lightbox.find('.lb-prev').fadeIn('slow');
    this.$lightbox.find('.lb-next').fadeIn('slow');

    if (totalImages > 1 && this.options.wrapAround) {
      this.$lightbox.find('.lb-prev, .lb-next').fadeIn('fast');
    } else {
      this.$lightbox.find('.lb-prev, .lb-next').fadeIn('slow');
    }
  };

  Lightbox.prototype.updateLabel = function () {
    const label = this.imageCountLabel(this.currentImageIndex + 1, this.album.length);
    this.$lightbox.find('.lb-number').text(label).fadeIn('slow');
  };

  Lightbox.prototype.sizeOverlay = function () {
    const size = {
      width: $(document).width(),
      height: $(document).height()
    };
    this.$overlay.width(size.width).height(size.height);
  };

  Lightbox.prototype.end = function () {
    this.disableKeyboardNav();
    $('select, object, embed').css({ visibility: 'visible' });
    this.$lightbox.fadeOut(this.options.fadeDuration);
    this.$overlay.fadeOut(this.options.fadeDuration);
    $('html').removeClass('lb-disable-scrolling');
  };

  Lightbox.prototype.disableKeyboardNav = function () {
    $(document).off('keyup');
  };

  return Lightbox;
}));
