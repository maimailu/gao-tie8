/*!
 * Start Bootstrap - Agency Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Animated numbers in the company statistics
(function () {
    const counters = document.querySelectorAll('.stat-count[data-count]');
    if (!counters.length) return;

    function animateCounter(element) {
        const target = Number(element.dataset.count);
        const duration = 1600;
        const startTime = performance.now();

        function update(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(target * eased);
            element.firstChild.nodeValue = String(value);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.firstChild.nodeValue = String(target);
            }
        }

        requestAnimationFrame(update);
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        counters.forEach(function (counter) {
            counter.firstChild.nodeValue = counter.dataset.count;
        });
    } else if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries, currentObserver) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const wowTarget = entry.target.closest('.wow') || entry.target;
                    const style = window.getComputedStyle(wowTarget);
                    const parseTime = function (value) {
                        const amount = parseFloat(value);
                        return value && value.includes('ms') ? amount : amount * 1000;
                    };
                    const delay = wowTarget.dataset.wowDelay
                        ? parseTime(wowTarget.dataset.wowDelay)
                        : parseTime(style.animationDelay);
                    const duration = wowTarget.dataset.wowDuration
                        ? parseTime(wowTarget.dataset.wowDuration)
                        : (parseTime(style.animationDuration) || 1000);

                    window.setTimeout(function () {
                        animateCounter(entry.target);
                    }, delay + duration + 100);
                    currentObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function (counter) {
            observer.observe(counter);
        });
    } else {
        counters.forEach(animateCounter);
    }
})();

if (typeof $.fn.scrollspy === 'function') {
    $('body').scrollspy({ target: '.navbar-fixed-top' });
}

$('.navbar-collapse ul li a').click(function () {
    $('.navbar-toggle:visible').click();
});