exports.slider = ({
    dot,
    slide,
    // nextArrow,
    // prevArrow,
    wrapper,
    field,
    dotsNames
}) => {
    const
    //  btnLeft = document.querySelector(prevArrow),
    //     btnRight = document.querySelector(nextArrow),
        slides = document.querySelectorAll(slide),
        slidesWrapper = document.querySelector(wrapper),
        slidesField = document.querySelector(field),
        dotWrapper = document.querySelector(dot);

    let slideIndex = 1,
        offset = 0,
        toSlide = 1,
        width = replaceWords(window.getComputedStyle(slidesWrapper).width);

    window.addEventListener('resize', fixOffset);

    for (let i = 1; i < slides.length + 1; i++) {
        const dot = document.createElement('div');
        dot.classList.add('slider-dot');
        dot.classList.add('not_hist');
        dot.dataset.index = i;
        dot.innerHTML = dotsNames[i - 1];
        dot.addEventListener('click', function () {
            goToSlideByDot(this.dataset.index);
        });
        dotWrapper.append(dot);
    }

    const dots = document.querySelectorAll('.not_hist');

    colorCurDot();

    slidesField.style.width = 100 * slides.length + '%';

    // btnRight.addEventListener('click', () => {
    //     toRight();
    //     if (slideIndex < slides.length) {
    //         slideIndex++;
    //     } else {
    //         slideIndex = 1;
    //     }
    //     colorCurDot();
    // });

    // btnLeft.addEventListener('click', () => {
    //     toLeft();
    //     if (slideIndex > 1) {
    //         slideIndex--;
    //     } else {
    //         slideIndex = slides.length;
    //     }
    //     colorCurDot();
    // });

    function toRight() {
        if (offset == width * (slides.length - 1)) {
            offset = 0;
        } else {
            offset += width * toSlide;
        }
        slidesField.style.transform = `translateX(-${offset}px)`;
    }

    function toLeft() {
        if (offset == 0) {
            offset = width * (slides.length - 1) * toSlide;
        } else {
            offset -= width * toSlide;
        }
        slidesField.style.transform = `translateX(-${offset}px)`;
    }

    function goToSlideByDot(dotIndex) {
        toSlide = Math.abs(dotIndex - slideIndex);
        if (dotIndex < slideIndex) {
            slideIndex = dotIndex;
            toLeft();
        } else if (dotIndex > slideIndex) {
            slideIndex = dotIndex;
            toRight();
        }
        toSlide = 1;
        colorCurDot();
    }

    function colorCurDot() {
        dots.forEach((item) => {
            item.style.background = "none";
            item.dataset.current = false;
        });
        dots[slideIndex - 1].style.background = "#fdc84b";
        dots[slideIndex - 1].dataset.current = true;
    }

    function fixSlideSize() {
        slides.forEach((slide) => {
            slide.style.width = `${width}px`;
        });
    }

    function fixSliderHeight() {
        document.querySelector('.slider').style.height = `${width/1.62}px`;
    }

    function fixOffset() {
        let temp = width;
        width = replaceWords(window.getComputedStyle(slidesWrapper).width);
        fixSlideSize();
        fixSliderHeight();
        if (width > temp) {
            offset += (slideIndex - 1) * Math.abs(width - temp);
        } else if (width < temp) {
            offset -= (slideIndex - 1) * Math.abs(width - temp);
        }
        slidesField.style.transform = `translateX(-${offset}px)`;
    }

    fixSlideSize();
    fixOffset();
    fixSliderHeight();
}

function replaceWords(element) {
    let lastNumIndexInWidth = element.length - element.split('').reverse().join('').search(/\d/);
    return Math.round(+element.split('').splice(0, lastNumIndexInWidth).join(''));
}   
