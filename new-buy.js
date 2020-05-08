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
    })

    function setSelectedColour(newSelectedColour) {
        selectedColour = newSelectedColour;

        $('.lrw-c-buy__colour-select__wrapper--active').removeClass('lrw-c-buy__colour-select__wrapper--active')
        $('#lrw-id-colour-select--' + newSelectedColour).addClass('lrw-c-buy__colour-select__wrapper--active');

    }

    async function setQty(variant, qty) {
        Cookies.set('_lrc-qty-' + variant, qty);
        await updateCheckout();
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

});