$(document).ready(async function () {

    var selectedColour = "black";

    const colourSelectBlack = $('#lrw-id-colour-select--black');
    const colourSelectGrey = $('#lrw-id-colour-select--grey');
    const colourSelectSilver = $('#lrw-id-colour-select--silver');
    const colourSelectOrange = $('#lrw-id-colour-select--orange');

    const btnAddToCart = $('#lrw-id-btn-add-to-cart');
    

    colourSelectBlack.click(function () {
        setSelectedColour('black');
    });

    colourSelectGrey.click(function () {
        setSelectedColour('grey');
    });

    colourSelectSilver.click(function () {
        setSelectedColour('silver');
    });

    colourSelectOrange.click(function () {
        setSelectedColour('orange');
    });

    btnAddToCart.click(function() {
        incrementQty(selectedColour);
        setBuyNotification();
    })

    function setSelectedColour(newSelectedColour) {
        selectedColour = newSelectedColour;

        $('.lrw-c-buy__colour-select__wrapper--active').removeClass('lrw-c-buy__colour-select__wrapper--active')
        $('#lrw-id-colour-select--' + newSelectedColour).addClass('lrw-c-buy__colour-select__wrapper--active');

    }

    async function setQty(variant, qty) {
        Cookies.set('_lrc-qty-' + variant, qty);
    }

    function getQty(variant) {
        var qty = Cookies.get('_lrc-qty-' + variant);
        if (qty === undefined) {
            return 0;
        }
        return parseInt(qty, 10);
    }

    function incrementQty(variant) {
        var qty = getQty(variant);
        qty++;
        setQty(variant, qty);

        gtag('event', 'add_to_cart', {
            "items": [
              {
                "id": variant,
                "name": "T1.01",
                "brand": "Tiller",
                "variant": variant,
                "quantity": 1,
                "price": '135.00'
              }
            ]
        });
    }

    function setBuyNotification() {
      
        var qtyBlack = parseInt(Cookies.get('_lrc-qty-black'), 10);
        var qtyGrey = parseInt(Cookies.get('_lrc-qty-grey'), 10);
        var qtySilver = parseInt(Cookies.get('_lrc-qty-silver'), 10);
        var qtyOrange = parseInt(Cookies.get('_lrc-qty-orange'), 10);
      
      	qtyBlack = isNaN(qtyBlack) ? 0 : qtyBlack;
        qtyGrey = isNaN(qtyGrey) ? 0 : qtyGrey;
        qtySilver = isNaN(qtySilver) ? 0 : qtySilver;
        qtyOrange = isNaN(qtyOrange) ? 0 : qtyOrange;
      
        var qtyTotal = qtyBlack + qtyGrey + qtySilver + qtyOrange;

        if (qtyTotal > 0) {
            $('#lrw-id-side-nav__link__buy-qty').text(qtyTotal);
            $('#lrw-id-side-nav__link__buy-qty').addClass('lrw-c-side-nav__link__buy-qty--visible');
        } else {
            $('#lrw-id-side-nav__link__buy-qty').removeClass('lrw-c-side-nav__link__buy-qty--visible');
        }
    }

});