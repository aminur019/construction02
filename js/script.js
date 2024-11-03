/**
 * Global variables
 */
"use strict";
(function() {

    var userAgent = navigator.userAgent.toLowerCase(),
        initialDate = new Date(),

        $document = $(document),
        $window = $(window),
        $html = $("html"),
        $body = $("body"),

        isRtl = $html.attr("dir") === "rtl",
        isDesktop = $html.hasClass("desktop"),
        isIE = userAgent.indexOf("msie") !== -1 ? parseInt(userAgent.split("msie")[1], 10) : userAgent.indexOf("trident") !== -1 ? 11 : userAgent.indexOf("edge") !== -1 ? 12 : false,
        isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        windowReady = false,
        isNoviBuilder = false,

        plugins = {
            bootstrapModal: $('.modal'),
            materialParallax: $('.parallax-container'),
            owl: $('.owl-carousel'),
            preloader: $('.preloader'),
            rdNavbar: $('.rd-navbar'),
            rdMailForm: $('.rd-mailform'),
            rdInputLabel: $('.form-label'),
            regula: $('[data-constraints]'),
            maps: $('.google-map-container'),
            swiper: $('.swiper-container'),
            wow: $('.wow'),
            counter: document.querySelectorAll('.counter'),
            copyrightYear: $('.copyright-year'),
            customToggle: $('[data-custom-toggle]')
        };

    /**
     * @desc Check the element was been scrolled into the view
     * @param {object} elem - jQuery object
     * @return {boolean}
     */
    function isScrolledIntoView(elem) {
        if (isNoviBuilder) return true;
        return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
    }

    /**
     * @desc Calls a function when element has been scrolled into the view
     * @param {object} element - jQuery object
     * @param {function} func - init function
     */
    function lazyInit(element, func) {
        var scrollHandler = function() {
            if ((!element.hasClass('lazy-loaded') && (isScrolledIntoView(element)))) {
                func.call(element);
                element.addClass('lazy-loaded');
            }
        };

        scrollHandler();
        $window.on('scroll', scrollHandler);
    }

    // Initialize scripts that require a loaded window
    $window.on('load', function() {

        // Page loader & Page transition
        if (plugins.preloader.length && !isNoviBuilder) {
            pageTransition({
                target: document.querySelector('.page'),
                delay: 0,
                duration: 500,
                classIn: 'fadeIn',
                classOut: 'fadeOut',
                classActive: 'animated',
                conditions: function(event, link) {
                    return link && !/(\#|javascript:void\(0\)|callto:|tel:|mailto:|:\/\/)/.test(link) && !event.currentTarget.hasAttribute('data-lightgallery');
                },
                onTransitionStart: function(options) {
                    setTimeout(function() {
                        plugins.preloader.removeClass('loaded');
                    }, options.duration * .75);
                },
                onReady: function() {
                    plugins.preloader.addClass('loaded');
                    windowReady = true;
                }
            });
        }

        // Material Parallax
        if (plugins.materialParallax.length) {
            if (!isNoviBuilder && !isIE && !isMobile) {
                plugins.materialParallax.parallax();
            } else {
                for (let i = 0; i < plugins.materialParallax.length; i++) {
                    let $parallax = $(plugins.materialParallax[i]);

                    $parallax.addClass('parallax-disabled');
                    $parallax.css({
                        "background-image": 'url(' + $parallax.data("parallax-img") + ')'
                    });
                }
            }
        }
    });

    /**
     * Initialize All Scripts
     */
    $(function() {
        var isNoviBuilder = window.xMode;

        /**
         * Wrapper to eliminate json errors
         * @param {string} str - JSON string
         * @returns {object} - parsed or empty object
         */
        function parseJSON(str) {
            try {
                if (str) return JSON.parse(str);
                else return {};
            } catch (error) {
                console.warn(error);
                return {};
            }
        }

        /**
         * @desc Sets the actual previous index based on the position of the slide in the markup. Should be the most recent action.
         * @param {object} swiper - swiper instance
         */
        function setRealPrevious(swiper) {
            let element = swiper.$wrapperEl[0].children[swiper.activeIndex];
            swiper.realPrevious = Array.prototype.indexOf.call(element.parentNode.children, element);
        }

        /**
         * @desc Sets slides background images from attribute 'data-slide-bg'
         * @param {object} swiper - swiper instance
         */
        function setBackgrounds(swiper) {
            let swipersBg = swiper.el.querySelectorAll('[data-slide-bg]');

            for (let i = 0; i < swipersBg.length; i++) {
                let swiperBg = swipersBg[i];
                swiperBg.style.backgroundImage = 'url(' + swiperBg.getAttribute('data-slide-bg') + ')';
            }
        }

        /**
         * @desc Animate captions on active slides
         * @param {object} swiper - swiper instance
         */
        function initCaptionAnimate(swiper) {
            let
                animate = function(caption) {
                    return function() {
                        let duration;
                        if (duration = caption.getAttribute('data-caption-duration')) caption.style.animationDuration = duration + 'ms';
                        caption.classList.remove('not-animated');
                        caption.classList.add(caption.getAttribute('data-caption-animate'));
                        caption.classList.add('animated');
                    };
                },
                initializeAnimation = function(captions) {
                    for (let i = 0; i < captions.length; i++) {
                        let caption = captions[i];
                        caption.classList.remove('animated');
                        caption.classList.remove(caption.getAttribute('data-caption-animate'));
                        caption.classList.add('not-animated');
                    }
                },
                finalizeAnimation = function(captions) {
                    for (let i = 0; i < captions.length; i++) {
                        let caption = captions[i];
                        if (caption.getAttribute('data-caption-delay')) {
                            setTimeout(animate(caption), Number(caption.getAttribute('data-caption-delay')));
                        } else {
                            animate(caption)();
                        }
                    }
                };

            // Caption parameters
            swiper.params.caption = {
                animationEvent: 'slideChangeTransitionEnd'
            };

            initializeAnimation(swiper.$wrapperEl[0].querySelectorAll('[data-caption-animate]'));
            finalizeAnimation(swiper.$wrapperEl[0].children[swiper.activeIndex].querySelectorAll('[data-caption-animate]'));

            if (swiper.params.caption.animationEvent === 'slideChangeTransitionEnd') {
                swiper.on(swiper.params.caption.animationEvent, function() {
                    initializeAnimation(swiper.$wrapperEl[0].children[swiper.previousIndex].querySelectorAll('[data-caption-animate]'));
                    finalizeAnimation(swiper.$wrapperEl[0].children[swiper.activeIndex].querySelectorAll('[data-caption-animate]'));
                });
            } else {
                swiper.on('slideChangeTransitionEnd', function() {
                    initializeAnimation(swiper.$wrapperEl[0].children[swiper.previousIndex].querySelectorAll('[data-caption-animate]'));
                });

                swiper.on(swiper.params.caption.animationEvent, function() {
                    finalizeAnimation(swiper.$wrapperEl[0].children[swiper.activeIndex].querySelectorAll('[data-caption-animate]'));
                });
            }
        }

        /**
         * @desc Initialize owl carousel plugin
         * @param {object} carousel - carousel jQuery object
         */
        function initOwlCarousel(c) {
            var aliaces = ["-", "-sm-", "-md-", "-lg-", "-xl-", "-xxl-"],
                values = [0, 576, 768, 992, 1200, 1600],
                responsive = {};

            for (var j = 0; j < values.length; j++) {
                responsive[values[j]] = {};
                for (var k = j; k >= -1; k--) {
                    if (!responsive[values[j]]["items"] && c.attr("data" + aliaces[k] + "items")) {
                        responsive[values[j]]["items"] = k < 0 ? 1 : parseInt(c.attr("data" + aliaces[k] + "items"), 10);
                    }
                    if (!responsive[values[j]]["stagePadding"] && responsive[values[j]]["stagePadding"] !== 0 && c.attr("data" + aliaces[k] + "stage-padding")) {
                        responsive[values[j]]["stagePadding"] = k < 0 ? 0 : parseInt(c.attr("data" + aliaces[k] + "stage-padding"), 10);
                    }
                    if (!responsive[values[j]]["margin"] && responsive[values[j]]["margin"] !== 0 && c.attr("data" + aliaces[k] + "margin")) {
                        responsive[values[j]]["margin"] = k < 0 ? 30 : parseInt(c.attr("data" + aliaces[k] + "margin"), 10);
                    }
                }
            }

            // Enable custom pagination
            if (c.attr('data-dots-custom')) {
                c.on("initialized.owl.carousel", function(event) {
                    var carousel = $(event.currentTarget),
                        customPag = $(carousel.attr("data-dots-custom")),
                        active = 0;

                    if (carousel.attr('data-active')) {
                        active = parseInt(carousel.attr('data-active'), 10);
                    }

                    carousel.trigger('to.owl.carousel', [active, 300, true]);
                    customPag.find("[data-owl-item='" + active + "']").addClass("active");

                    customPag.find("[data-owl-item]").on('click', function(e) {
                        e.preventDefault();
                        carousel.trigger('to.owl.carousel', [parseInt(this.getAttribute("data-owl-item"), 10), 300, true]);
                    });

                    carousel.on("translate.owl.carousel", function(event) {
                        customPag.find(".active").removeClass("active");
                        customPag.find("[data-owl-item='" + event.item.index + "']").addClass("active")
                    });
                });
            }

            c.owlCarousel({
                autoplay: isNoviBuilder ? false : c.attr("data-autoplay") === "true",
                loop: isNoviBuilder ? false : c.attr("data-loop") !== "false",
                items: 1,
                rtl: isRtl,
                center: c.attr("data-center") === "true",
                dotsContainer: c.attr("data-pagination-class") || false,
                navContainer: c.attr("data-navigation-class") || false,
                mouseDrag: isNoviBuilder ? false : c.attr("data-mouse-drag") !== "false",
                nav: c.attr("data-nav") === "false",
                dots: c.attr("data-dots") === "true",
                dotsEach: c.attr("data-dots-each") ? parseInt(c.attr("data-dots-each"), 10) : false,
                animateIn: c.attr('data-animation-in') ? c.attr('data-animation-in') : false,
                animateOut: c.attr('data-animation-out') ? c.attr('data-animation-out') : false,
                responsive: responsive,
                navText: function() {
                    try {
                        return JSON.parse(c.attr("data-nav-text"));
                    } catch (e) {
                        return [];
                    }
                }(),
                navClass: function() {
                    try {
                        return JSON.parse(c.attr("data-nav-class"));
                    } catch (e) {
                        return ['owl-prev', 'owl-next'];
                    }
                }()
            });
        }

        /**
         * @desc Attach form validation to elements
         * @param {object} elements - jQuery object
         */
        function attachFormValidator(elements) {
            // Custom validator - phone number
            regula.custom({
                name: 'PhoneNumber',
                defaultMessage: 'Invalid phone number format',
                validator: function() {
                    if (this.value === '') return true;
                    else return /^(\+\d)?[0-9\-\(\) ]{5,}$/i.test(this.value);
                }
            });

            for (var i = 0; i < elements.length; i++) {
                var o = $(elements[i]),
                    v;
                o.addClass("form-control-has-validation").after("<span class='form-validation'></span>");
                v = o.parent().find(".form-validation");
                if (v.is(":last-child")) o.addClass("form-control-last-child");
            }

            elements.on('input change propertychange blur', function(e) {
                var $this = $(this),
                    results;

                if (e.type !== "blur")
                    if (!$this.parent().hasClass("has-error")) return;
                if ($this.parents('.rd-mailform').hasClass('success')) return;

                if ((results = $this.regula('validate')).length) {
                    for (i = 0; i < results.length; i++) {
                        $this.siblings(".form-validation").text(results[i].message).parent().addClass("has-error");
                    }
                } else {
                    $this.siblings(".form-validation").text("").parent().removeClass("has-error")
                }
            }).regula('bind');

            var regularConstraintsMessages = [{
                    type: regula.Constraint.Required,
                    newMessage: "The text field is required."
                },
                {
                    type: regula.Constraint.Email,
                    newMessage: "The email is not a valid email."
                },
                {
                    type: regula.Constraint.Numeric,
                    newMessage: "Only numbers are required"
                },
                {
                    type: regula.Constraint.Selected,
                    newMessage: "Please choose an option."
                }
            ];


            for (var i = 0; i < regularConstraintsMessages.length; i++) {
                var regularConstraint = regularConstraintsMessages[i];

                regula.override({
                    constraintType: regularConstraint.type,
                    defaultMessage: regularConstraint.newMessage
                });
            }
        }

        /**
         * @desc Check if all elements pass validation
         * @param {object} elements - object of items for validation
         * @param {object} captcha - captcha object for validation
         * @return {boolean}
         */
        function isValidated(elements, captcha) {
            var results, errors = 0;

            if (elements.length) {
                for (var j = 0; j < elements.length; j++) {

                    var $input = $(elements[j]);
                    if ((results = $input.regula('validate')).length) {
                        for (k = 0; k < results.length; k++) {
                            errors++;
                            $input.siblings(".form-validation").text(results[k].message).parent().addClass("has-error");
                        }
                    } else {
                        $input.siblings(".form-validation").text("").parent().removeClass("has-error")
                    }
                }

                if (captcha) {
                    if (captcha.length) {
                        return validateReCaptcha(captcha) && errors === 0
                    }
                }

                return errors === 0;
            }
            return true;
        }

        /**
         * @desc Validate google reCaptcha
         * @param {object} captcha - captcha object for validation
         * @return {boolean}
         */
        function validateReCaptcha(captcha) {
            var captchaToken = captcha.find('.g-recaptcha-response').val();

            if (captchaToken.length === 0) {
                captcha
                    .siblings('.form-validation')
                    .html('Please, prove that you are not robot.')
                    .addClass('active');
                captcha
                    .closest('.form-wrap')
                    .addClass('has-error');

                captcha.on('propertychange', function() {
                    var $this = $(this),
                        captchaToken = $this.find('.g-recaptcha-response').val();

                    if (captchaToken.length > 0) {
                        $this
                            .closest('.form-wrap')
                            .removeClass('has-error');
                        $this
                            .siblings('.form-validation')
                            .removeClass('active')
                            .html('');
                        $this.off('propertychange');
                    }
                });

                return false;
            }

            return true;
        }

        /**
         * @desc Google map function for getting latitude and longitude
         */
        function getLatLngObject(str, marker, map, callback) {
            var coordinates = {};
            try {
                coordinates = JSON.parse(str);
                callback(new google.maps.LatLng(
                    coordinates.lat,
                    coordinates.lng
                ), marker, map)
            } catch (e) {
                map.geocoder.geocode({
                    'address': str
                }, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        var latitude = results[0].geometry.location.lat();
                        var longitude = results[0].geometry.location.lng();

                        callback(new google.maps.LatLng(
                            parseFloat(latitude),
                            parseFloat(longitude)
                        ), marker, map)
                    }
                })
            }
        }

        /**
         * @desc Initialize Google maps
         */
        function initMaps() {
            var key;

            for (var i = 0; i < plugins.maps.length; i++) {
                if (plugins.maps[i].hasAttribute("data-key")) {
                    key = plugins.maps[i].getAttribute("data-key");
                    break;
                }
            }

            $.getScript('//maps.google.com/maps/api/js?' + (key ? 'key=' + key + '&' : '') + 'libraries=geometry,places&v=quarterly', function() {
                var head = document.getElementsByTagName('head')[0],
                    insertBefore = head.insertBefore;

                head.insertBefore = function(newElement, referenceElement) {
                    if (newElement.href && newElement.href.indexOf('//fonts.googleapis.com/css?family=Roboto') !== -1 || newElement.innerHTML.indexOf('gm-style') !== -1) {
                        return;
                    }
                    insertBefore.call(head, newElement, referenceElement);
                };
                var geocoder = new google.maps.Geocoder;
                for (var i = 0; i < plugins.maps.length; i++) {
                    var zoom = parseInt(plugins.maps[i].getAttribute("data-zoom"), 10) || 11;
                    var styles = plugins.maps[i].hasAttribute('data-styles') ? JSON.parse(plugins.maps[i].getAttribute("data-styles")) : [];
                    var center = plugins.maps[i].getAttribute("data-center") || "New York";

                    // Initialize map
                    var map = new google.maps.Map(plugins.maps[i].querySelectorAll(".google-map")[0], {
                        zoom: zoom,
                        styles: styles,
                        scrollwheel: false,
                        center: {
                            lat: 0,
                            lng: 0
                        }
                    });

                    // Add map object to map node
                    plugins.maps[i].map = map;
                    plugins.maps[i].geocoder = geocoder;
                    plugins.maps[i].keySupported = true;
                    plugins.maps[i].google = google;

                    // Get Center coordinates from attribute
                    getLatLngObject(center, null, plugins.maps[i], function(location, markerElement, mapElement) {
                        mapElement.map.setCenter(location);
                    });

                    // Add markers from google-map-markers array
                    var markerItems = plugins.maps[i].querySelectorAll(".google-map-markers li");

                    if (markerItems.length) {
                        var markers = [];
                        for (var j = 0; j < markerItems.length; j++) {
                            var markerElement = markerItems[j];
                            getLatLngObject(markerElement.getAttribute("data-location"), markerElement, plugins.maps[i], function(location, markerElement, mapElement) {
                                var icon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon");
                                var activeIcon = markerElement.getAttribute("data-icon-active") || mapElement.getAttribute("data-icon-active");
                                var info = markerElement.getAttribute("data-description") || "";
                                var infoWindow = new google.maps.InfoWindow({
                                    content: info
                                });
                                markerElement.infoWindow = infoWindow;
                                var markerData = {
                                    position: location,
                                    map: mapElement.map
                                }
                                if (icon) {
                                    markerData.icon = icon;
                                }
                                var marker = new google.maps.Marker(markerData);
                                markerElement.gmarker = marker;
                                markers.push({
                                    markerElement: markerElement,
                                    infoWindow: infoWindow
                                });
                                marker.isActive = false;
                                // Handle infoWindow close click
                                google.maps.event.addListener(infoWindow, 'closeclick', (function(markerElement, mapElement) {
                                    var markerIcon = null;
                                    markerElement.gmarker.isActive = false;
                                    markerIcon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon");
                                    markerElement.gmarker.setIcon(markerIcon);
                                }).bind(this, markerElement, mapElement));


                                // Set marker active on Click and open infoWindow
                                google.maps.event.addListener(marker, 'click', (function(markerElement, mapElement) {
                                    if (markerElement.infoWindow.getContent().length === 0) return;
                                    var gMarker, currentMarker = markerElement.gmarker,
                                        currentInfoWindow;
                                    for (var k = 0; k < markers.length; k++) {
                                        var markerIcon;
                                        if (markers[k].markerElement === markerElement) {
                                            currentInfoWindow = markers[k].infoWindow;
                                        }
                                        gMarker = markers[k].markerElement.gmarker;
                                        if (gMarker.isActive && markers[k].markerElement !== markerElement) {
                                            gMarker.isActive = false;
                                            markerIcon = markers[k].markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon")
                                            gMarker.setIcon(markerIcon);
                                            markers[k].infoWindow.close();
                                        }
                                    }

                                    currentMarker.isActive = !currentMarker.isActive;
                                    if (currentMarker.isActive) {
                                        if (markerIcon = markerElement.getAttribute("data-icon-active") || mapElement.getAttribute("data-icon-active")) {
                                            currentMarker.setIcon(markerIcon);
                                        }

                                        currentInfoWindow.open(map, marker);
                                    } else {
                                        if (markerIcon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon")) {
                                            currentMarker.setIcon(markerIcon);
                                        }
                                        currentInfoWindow.close();
                                    }
                                }).bind(this, markerElement, mapElement))
                            })
                        }
                    }
                }
            });
        }

        // Additional class on html if mac os.
        if (navigator.platform.match(/(Mac)/i)) {
            $html.addClass("mac-os");
        }

        // Adds some loosing functionality to IE browsers (IE Polyfills)
        if (isIE) {
            if (isIE === 12) $html.addClass("ie-edge");
            if (isIE === 11) $html.addClass("ie-11");
            if (isIE < 10) $html.addClass("lt-ie-10");
            if (isIE < 11) $html.addClass("ie-10");
        }

        // Bootstrap Modal
        if (plugins.bootstrapModal.length) {
            for (var i = 0; i < plugins.bootstrapModal.length; i++) {
                var modalItem = $(plugins.bootstrapModal[i]);

                modalItem.on('hidden.bs.modal', $.proxy(function() {
                    var activeModal = $(this),
                        rdVideoInside = activeModal.find('video'),
                        youTubeVideoInside = activeModal.find('iframe');

                    if (rdVideoInside.length) {
                        rdVideoInside[0].pause();
                    }

                    if (youTubeVideoInside.length) {
                        var videoUrl = youTubeVideoInside.attr('src');

                        youTubeVideoInside
                            .attr('src', '')
                            .attr('src', videoUrl);
                    }
                }, modalItem))
            }
        }

        // Copyright Year (Evaluates correct copyright year)
        if (plugins.copyrightYear.length) {
            plugins.copyrightYear.text(initialDate.getFullYear());
        }

        // Google maps
        if (plugins.maps.length) {
            lazyInit(plugins.maps, initMaps);
        }

        // UI To Top
        if (isDesktop && !isNoviBuilder) {
            $().UItoTop({
                easingType: 'easeOutQuad',
                containerClass: 'ui-to-top fa fa-angle-up',
                scrollSpeed: 1
            });
        }

        // RD Navbar
        if (plugins.rdNavbar.length) {
            var
                navbar = plugins.rdNavbar,
                aliases = {
                    '-': 0,
                    '-sm-': 576,
                    '-md-': 768,
                    '-lg-': 992,
                    '-xl-': 1200,
                    '-xxl-': 1600
                },
                responsive = {};

            for (var alias in aliases) {
                var link = responsive[aliases[alias]] = {};
                if (navbar.attr('data' + alias + 'layout')) link.layout = navbar.attr('data' + alias + 'layout');
                if (navbar.attr('data' + alias + 'device-layout')) link.deviceLayout = navbar.attr('data' + alias + 'device-layout');
                if (navbar.attr('data' + alias + 'hover-on')) link.focusOnHover = navbar.attr('data' + alias + 'hover-on') === 'true';
                if (navbar.attr('data' + alias + 'auto-height')) link.autoHeight = navbar.attr('data' + alias + 'auto-height') === 'true';
                if (navbar.attr('data' + alias + 'stick-up-offset')) link.stickUpOffset = navbar.attr('data' + alias + 'stick-up-offset');
                if (navbar.attr('data' + alias + 'stick-up')) link.stickUp = navbar.attr('data' + alias + 'stick-up') === 'true';
                if (isNoviBuilder) link.stickUp = false;
                else if (navbar.attr('data' + alias + 'stick-up')) link.stickUp = navbar.attr('data' + alias + 'stick-up') === 'true';
            }

            plugins.rdNavbar.RDNavbar({
                anchorNav: !isNoviBuilder,
                stickUpClone: (plugins.rdNavbar.attr("data-stick-up-clone") && !isNoviBuilder) ? plugins.rdNavbar.attr("data-stick-up-clone") === 'true' : false,
                responsive: responsive,
                callbacks: {
                    onStuck: function() {
                        var navbarSearch = this.$element.find('.rd-search input');

                        if (navbarSearch) {
                            navbarSearch.val('').trigger('propertychange');
                        }
                    },
                    onDropdownOver: function() {
                        return !isNoviBuilder;
                    },
                    onUnstuck: function() {
                        if (this.$clone === null)
                            return;

                        var navbarSearch = this.$clone.find('.rd-search input');

                        if (navbarSearch) {
                            navbarSearch.val('').trigger('propertychange');
                            navbarSearch.trigger('blur');
                        }

                    }
                }
            });

            if (plugins.rdNavbar.attr("data-body-class")) {
                document.body.className += ' ' + plugins.rdNavbar.attr("data-body-class");
            }
        }

        // Swiper
        if (plugins.swiper.length) {

            for (let i = 0; i < plugins.swiper.length; i++) {

                let
                    node = plugins.swiper[i],
                    params = parseJSON(node.getAttribute('data-swiper')),
                    defaults = {
                        speed: 1000,
                        loop: true,
                        pagination: {
                            el: '.swiper-pagination',
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev'
                        },
                        autoplay: {
                            delay: 5000
                        }
                    },
                    xMode = {
                        autoplay: false,
                        loop: false,
                        simulateTouch: false
                    };

                params.on = {
                    init: function() {
                        setBackgrounds(this);
                        setRealPrevious(this);
                        initCaptionAnimate(this);

                        // Real Previous Index must be set recent
                        this.on('slideChangeTransitionEnd', function() {
                            setRealPrevious(this);
                        });
                    }
                };

                new Swiper(node, Util.merge(isNoviBuilder ? [defaults, params, xMode] : [defaults, params]));
            }
        }

        // Owl carousel
        if (plugins.owl.length) {
            for (var i = 0; i < plugins.owl.length; i++) {
                var carousel = $(plugins.owl[i]);
                plugins.owl[i].owl = carousel;
                initOwlCarousel(carousel);
            }
        }

        // WOW
        if ($html.hasClass("wow-animation") && plugins.wow.length && !isNoviBuilder && isDesktop) {
            new WOW().init();
        }

        // RD Input Label
        if (plugins.rdInputLabel.length) {
            plugins.rdInputLabel.RDInputLabel();
        }

        // Regula
        if (plugins.regula.length) {
            attachFormValidator(plugins.regula);
        }

        // RD Mailform
        if (plugins.rdMailForm.length) {
            var i, j, k,
                msg = {
                    'MF000': 'Successfully sent!',
                    'MF001': 'Recipients are not set!',
                    'MF002': 'Form will not work locally!',
                    'MF003': 'Please, define email field in your form!',
                    'MF004': 'Please, define type of your form!',
                    'MF254': 'Something went wrong with PHPMailer!',
                    'MF255': 'Aw, snap! Something went wrong.'
                };

            for (i = 0; i < plugins.rdMailForm.length; i++) {
                var $form = $(plugins.rdMailForm[i]),
                    formHasCaptcha = false;

                $form.attr('novalidate', 'novalidate').ajaxForm({
                    data: {
                        "form-type": $form.attr("data-form-type") || "contact",
                        "counter": i
                    },
                    beforeSubmit: function(arr, $form, options) {
                        if (isNoviBuilder)
                            return;

                        var form = $(plugins.rdMailForm[this.extraData.counter]),
                            inputs = form.find("[data-constraints]"),
                            output = $("#" + form.attr("data-form-output")),
                            captcha = form.find('.recaptcha'),
                            captchaFlag = true;

                        output.removeClass("active error success");

                        if (isValidated(inputs, captcha)) {

                            // veify reCaptcha
                            if (captcha.length) {
                                var captchaToken = captcha.find('.g-recaptcha-response').val(),
                                    captchaMsg = {
                                        'CPT001': 'Please, setup you "site key" and "secret key" of reCaptcha',
                                        'CPT002': 'Something wrong with google reCaptcha'
                                    };

                                formHasCaptcha = true;

                                $.ajax({
                                        method: "POST",
                                        url: "bat/reCaptcha.php",
                                        data: {
                                            'g-recaptcha-response': captchaToken
                                        },
                                        async: false
                                    })
                                    .done(function(responceCode) {
                                        if (responceCode !== 'CPT000') {
                                            if (output.hasClass("snackbars")) {
                                                output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + captchaMsg[responceCode] + '</span></p>')

                                                setTimeout(function() {
                                                    output.removeClass("active");
                                                }, 3500);

                                                captchaFlag = false;
                                            } else {
                                                output.html(captchaMsg[responceCode]);
                                            }

                                            output.addClass("active");
                                        }
                                    });
                            }

                            if (!captchaFlag) {
                                return false;
                            }

                            form.addClass('form-in-process');

                            if (output.hasClass("snackbars")) {
                                output.html('<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>');
                                output.addClass("active");
                            }
                        } else {
                            return false;
                        }
                    },
                    error: function(result) {
                        if (isNoviBuilder)
                            return;

                        var output = $("#" + $(plugins.rdMailForm[this.extraData.counter]).attr("data-form-output")),
                            form = $(plugins.rdMailForm[this.extraData.counter]);

                        output.text(msg[result]);
                        form.removeClass('form-in-process');

                        if (formHasCaptcha) {
                            grecaptcha.reset();
                        }
                    },
                    success: function(result) {
                        if (isNoviBuilder)
                            return;

                        var form = $(plugins.rdMailForm[this.extraData.counter]),
                            output = $("#" + form.attr("data-form-output")),
                            select = form.find('select');

                        form
                            .addClass('success')
                            .removeClass('form-in-process');

                        if (formHasCaptcha) {
                            grecaptcha.reset();
                        }

                        result = result.length === 5 ? result : 'MF255';
                        output.text(msg[result]);

                        if (result === "MF000") {
                            if (output.hasClass("snackbars")) {
                                output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + msg[result] + '</span></p>');
                            } else {
                                output.addClass("active success");
                            }
                        } else {
                            if (output.hasClass("snackbars")) {
                                output.html(' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + msg[result] + '</span></p>');
                            } else {
                                output.addClass("active error");
                            }
                        }

                        form.clearForm();

                        if (select.length) {
                            select.select2("val", "");
                        }

                        form.find('input, textarea').trigger('blur');

                        setTimeout(function() {
                            output.removeClass("active error success");
                            form.removeClass('success');
                        }, 3500);
                    }
                });
            }
        }

        // Counter
        if (plugins.counter) {
            for (let i = 0; i < plugins.counter.length; i++) {
                let
                    node = plugins.counter[i],
                    counter = aCounter({
                        node: node,
                        duration: node.getAttribute('data-duration') || 1000
                    }),
                    scrollHandler = (function() {
                        if (Util.inViewport(this) && !this.classList.contains('animated-first')) {
                            this.counter.run();
                            this.classList.add('animated-first');
                        }
                    }).bind(node),
                    blurHandler = (function() {
                        this.counter.params.to = parseInt(this.textContent, 10);
                        this.counter.run();
                    }).bind(node);

                if (isNoviBuilder) {
                    node.counter.run();
                    node.addEventListener('blur', blurHandler);
                } else {
                    scrollHandler();
                    window.addEventListener('scroll', scrollHandler);
                }
            }
        }

        // Custom Toggles
        if (plugins.customToggle.length) {
            for (var i = 0; i < plugins.customToggle.length; i++) {
                var $this = $(plugins.customToggle[i]);

                $this.on('click', $.proxy(function(event) {
                    event.preventDefault();

                    var $ctx = $(this);
                    $($ctx.attr('data-custom-toggle')).add(this).toggleClass('active');
                }, $this));

                if ($this.attr("data-custom-toggle-hide-on-blur") === "true") {
                    $body.on("click", $this, function(e) {
                        if (e.target !== e.data[0] &&
                            $(e.data.attr('data-custom-toggle')).find($(e.target)).length &&
                            e.data.find($(e.target)).length === 0) {
                            $(e.data.attr('data-custom-toggle')).add(e.data[0]).removeClass('active');
                        }
                    })
                }

                if ($this.attr("data-custom-toggle-disable-on-blur") === "true") {
                    $body.on("click", $this, function(e) {
                        if (e.target !== e.data[0] && $(e.data.attr('data-custom-toggle')).find($(e.target)).length === 0 && e.data.find($(e.target)).length === 0) {
                            $(e.data.attr('data-custom-toggle')).add(e.data[0]).removeClass('active');
                        }
                    })
                }
            }
        }
    });
}());