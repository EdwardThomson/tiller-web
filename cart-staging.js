$(document).ready(async function () {
    //showLoader();
    //const baseUrl = 'https://ecommerce.gettiller.com/';
    //const apiUrl = 'https://restcountries.eu/rest/v2/all';

    $('#lrw-id-checkout__qty--black,#lrw-id-checkout__qty--grey,#lrw-id-checkout__qty--silver,#lrw-id-checkout__qty--orange').attr('disabled', 'disabled');


    $('#lrw-id-btn-add-to-cart--black').click(function() {
        incrementQty("black");
    });

    $('#lrw-id-btn-add-to-cart--grey').click(function() {
        incrementQty("grey");
    });

    $('#lrw-id-btn-add-to-cart--silver').click(function() {
        incrementQty("silver");
    });

    $('#lrw-id-btn-add-to-cart--orange').click(function() {
        incrementQty("orange");
    });

    $('.lrw-c-cart__plan').click(function() {
        //console.log('click', getPlan());
        var planSetSelected = getIsPlanSelected();

        if (planSetSelected === 'null' || planSetSelected === null || planSetSelected === undefined || planSetSelected === false) {
            console.log('set true');
            setIsPlanSelected('true');
        } else {
            console.log('set false');
            setIsPlanSelected('false');
        }
    });

    $('.lrw-c-plan-annual').click(function() {

        console.log('annual');

        setPlanType('pro-annual');
    });

    $('.lrw-c-plan-monthly').click(function() {

        console.log('monthly');

        setPlanType('pro-monthly');
    });


    //$('#loaderContainer,#errorContainer,#failed,#success,#failed-form,#success-form').hide();
    //$('#payment-form').attr('method', null);

    //$('#failed-form,#success-form').remove();

    //$('#lrw-id-checkout__order-summary--discount--applied').append(`<span class="span" id="remove-btn"><div class="remove-btn"></div>Remove</span>`).hide();
    //$('#lrw-id-checkout__order-summary--discount').append(`<p class="error-msg" id="invalid-coupon" style="display: none;">Invalid Coupon</p>`);
    //$('#shippingParent').append(`<p class="ship-error-msg" id="invalidShipping" style="display: none;">Postal code and Country are mandatory</p>`);

    //const {data: {products, planPrice, planId}} = await getProducts();
    //products.map(item => $(`#${item.colour}Img`).attr("src", item.image));
    //$('#plan-id').val(planId);
    //setProductPrices(products, planPrice);

    //hideLoader();

    function addZeroes(num) {
        var value = Number(String(num));
        var res = String(num).split(".");
        if (res.length > 1 && res[1].length < 3) {
            value = value.toFixed(2);
        }
        return value;
    }

    //$("#lrw-id-summary__total-plan-description").text(`$${planPrice}/month, billed annually`);

    const priceBlack = 129;//parseFloat(products.find(e => e.colour === 'black').price.toFixed(2));
    const priceGrey = 129;//parseFloat(products.find(e => e.colour === 'grey').price.toFixed(2));
    const priceSliver = 129;//parseFloat(products.find(e => e.colour === 'silver').price.toFixed(2));
    const priceOrange = 129;//parseFloat(products.find(e => e.colour === 'orange').price.toFixed(2));

    const planPrice = 8;

    //var discountPercentage = 0;
    var gstPercentage = 0;
    var shippingCharge = null;

    var qtyBlack;
    var qtyGrey;
    var qtySilver;
    var qtyOrange;

    var items = [];

    const orderSummaryRowBlack = $('#lrw-id-checkout__order-summary--black');
    const orderSummaryRowGrey = $('#lrw-id-checkout__order-summary--grey');
    const orderSummaryRowSilver = $('#lrw-id-checkout__order-summary--silver');
    const orderSummaryRowOrange = $('#lrw-id-checkout__order-summary--orange');

    $('#increment-black').click(function (e) {
        e.stopPropagation();
        incrementQty('black');
        return false;
    });
    $('#decrement-black').click(function (e) {
        e.stopPropagation();
        decrementQty('black');
        return false;
    });
    $('#increment-grey').click(function (e) {
        e.stopPropagation();
        incrementQty('grey');
        return false;
    });
    $('#decrement-grey').click(function (e) {
        e.stopPropagation();
        decrementQty('grey');
        return false;
    });
    $('#increment-silver').click(function (e) {
        e.stopPropagation();
        incrementQty('silver');
        return false;
    });
    $('#decrement-silver').click(function (e) {
        e.stopPropagation();
        decrementQty('silver');
        return false;
    });
    $('#increment-orange').click(function (e) {
        e.stopPropagation();
        incrementQty('orange');
        return false;
    });
    $('#decrement-orange').click(function (e) {
        e.stopPropagation();
        decrementQty('orange');
        return false;
    });

    async function setIsPlanSelected(plan) {
        Cookies.set('_lrc-is-plan-selected', plan);
        await updateCart();
    }

    function getIsPlanSelected() {
        var storedPlanSelected = Cookies.get('_lrc-is-plan-selected');
        if (storedPlanSelected === undefined) {
            return null;
        }
        return storedPlanSelected;
    }    

    async function setPlanType(plan) {
        Cookies.set('_lrc-plan-type', plan);
        await updateCart();
    }

    function getPlanType() {
        var storedPlanType = Cookies.get('_lrc-plan-type');
        if (storedPlanType === undefined) {
            return null;
        }
        return storedPlanType;
    }

    async function setQty(variant, qty) {
        Cookies.set('_lrc-qty-' + variant, qty);
        await updateCart();
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
    }

    function decrementQty(variant) {
        var qty = getQty(variant);
        if (qty > 0) {
            qty--;
        } else {
            qty = 0;
        }
        setQty(variant, qty);
    }

    function updateCart() {

        gstPercentage = $("#countryList option:selected").val() === 'AU' ? 10 : 0;
        //shippingCharge = $("input[name=shippingOptions]:checked").val() || 0;

        qtyBlack = getQty('black');
        qtyGrey = getQty('grey');
        qtySilver = getQty('silver');
        qtyOrange = getQty('orange');
        qtyTotal = qtyBlack + qtyGrey + qtySilver + qtyOrange;

        planSelected = getIsPlanSelected();
        planType = getPlanType();

        items = [];

        productPrice = parseFloat(((qtyBlack * priceBlack) + (qtyGrey * priceGrey) + (qtySilver * priceSliver) + (qtyOrange * priceOrange)).toFixed(2))
        subscriptionPrice = parseFloat((qtyTotal * 12 * planPrice).toFixed(2));
        //discountPrice = parseFloat(((productPrice + subscriptionPrice) * (discountPercentage / 100)).toFixed(2));
        gstPrice = parseFloat(((productPrice + subscriptionPrice/* - discountPrice*/) * (gstPercentage / 100)).toFixed(2));

        subtotalPrice = productPrice + subscriptionPrice;

        if (gstPercentage === 0) {
            $('#lrw-id-checkout__order-summary--gst').hide();
        } else {
            $('#lrw-id-checkout__order-summary--gst').show();
        }

        /*if (discountPrice === 0) {
            //$("#lrw-id-checkout__order-summary--discount--applied").hide();
            $("#lrw-id-checkout__summary--discount-button").show();
            $("#lrw-id-checkout__order-summary--discount--applied-price").hide();
        } else {
            //$("#lrw-id-checkout__order-summary--discount--applied").show();
            $("#lrw-id-checkout__summary--discount-button").hide();
            $("#lrw-id-checkout__order-summary--discount--applied-price").show();
        }*/

        $('#lrw-id-checkout__order-summary--gst-price').text(`$${addZeroes(gstPrice)}`);
        $('#lrw-id-checkout__order-summary--gst-label').text(`GST (${gstPercentage}%)`);
        //$("#lrw-id-checkout__order-summary--discount--applied-price").text(`-$${addZeroes(discountPrice)}`);

        $('#lrw-id-checkout__qty--black').val(qtyBlack);
        $('#lrw-id-checkout__qty--grey').val(qtyGrey);
        $('#lrw-id-checkout__qty--silver').val(qtySilver);
        $('#lrw-id-checkout__qty--orange').val(qtyOrange);

        //$('#lrw-id-checkout__summary__qty--black').text(qtyBlack + " x ");
        //$('#lrw-id-checkout__summary__qty--grey').text(qtyGrey + " x ");
        //$('#lrw-id-checkout__summary__qty--silver').text(qtySilver + " x ");
        //$('#lrw-id-checkout__summary__qty--orange').text(qtyOrange + " x ");

        if (qtyBlack > 0) {
            orderSummaryRowBlack.removeClass('lrw-c-cart__add--hidden');
            $('#lrw-id-summary__total-device--black').text(`$${addZeroes(parseFloat((qtyBlack * priceBlack).toFixed(2)))}`);

            items.push({
                "id": 'black',
                "name": "T1.01",
                "brand": "Tiller",
                "variant": 'black',
                "quantity": qtyBlack,
                "price": `${135 * qtyBlack}`
            });

        } else {
            orderSummaryRowBlack.addClass('lrw-c-cart__add--hidden');
        }
        if (qtyGrey > 0) {
            orderSummaryRowGrey.removeClass('lrw-c-cart__add--hidden');
            $('#lrw-id-summary__total-device--grey').text(`$${addZeroes(parseFloat((qtyGrey * priceGrey).toFixed(2)))}`);

            items.push({
                "id": 'grey',
                "name": "T1.01",
                "brand": "Tiller",
                "variant": 'grey',
                "quantity": qtyGrey,
                "price": `${135 * qtyGrey}`
            });

        } else {
            orderSummaryRowGrey.addClass('lrw-c-cart__add--hidden');
        }
        if (qtySilver > 0) {
            orderSummaryRowSilver.removeClass('lrw-c-cart__add--hidden');
            $('#lrw-id-summary__total-device--silver').text(`$${addZeroes(parseFloat((qtySilver * priceSliver).toFixed(2)))}`);

            items.push({
                "id": 'silver',
                "name": "T1.01",
                "brand": "Tiller",
                "variant": 'silver',
                "quantity": qtySilver,
                "price": `${135 * qtySilver}`
            });

        } else {
            orderSummaryRowSilver.addClass('lrw-c-cart__add--hidden');
        }
        if (qtyOrange > 0) {
            orderSummaryRowOrange.removeClass('lrw-c-cart__add--hidden');
            $('#lrw-id-summary__total-device--orange').text(`$${addZeroes(parseFloat((qtyOrange * priceOrange).toFixed(2)))}`);

            items.push({
                "id": 'orange',
                "name": "T1.01",
                "brand": "Tiller",
                "variant": 'orange',
                "quantity": qtyOrange,
                "price": `${135 * qtyOrange}`
            });

        } else {
            orderSummaryRowOrange.addClass('lrw-c-cart__add--hidden');
        }
        if (qtyTotal > 0) {
            let totalPrice = (parseFloat(((productPrice /*- discountPrice*/) + gstPrice + subscriptionPrice).toFixed(2)) + parseFloat(shippingCharge)).toFixed(2);
            $('#lrw-id-summary__total-plan').text(`$${qtyTotal * 12 * planPrice}`);
            $('#lrw-id-checkout__qty--total').text(`${qtyTotal}`);
            $('#lrw-id-summary__total').text(`USD $${addZeroes(totalPrice)}`);
            $('#lrw-id-btn__checkout').removeClass('lrw-c-button--disabled').attr("disabled", false);
            $('#lrw-id-checkout__order-summary--subscription').show();
            $("#checkout-pay-btn").val(`Pay USD $${addZeroes(totalPrice)}`).attr("disabled", false);
            $('#lrw-id-checkout__order-summary--shipping-price').text(`${addZeroes(shippingCharge) ? '$' + addZeroes(shippingCharge) : 'Not Selected'}`);
            $("#lrw-id-checkout__order-summary--shipping").show();
            $("#lrw-id-checkout__order-summary--subtotal-price").text('$' + addZeroes(subtotalPrice));

            $('.lrw-c-side-nav__link__buy-qty').text(qtyTotal);
            $('.lrw-c-side-nav__link__buy-qty').addClass('lrw-c-side-nav__link__buy-qty--visible');

        } else {
            $('#lrw-id-checkout__order-summary--subscription').hide();
            $('#lrw-id-summary__total-plan').text('-');
            $('#lrw-id-checkout__qty--total').text('-');
            $('#lrw-id-summary__total').text('-');
            $('#lrw-id-btn__checkout').addClass('lrw-c-button--disabled').attr("disabled", true);
            $("#checkout-pay-btn").val(`Pay`).attr("disabled", true);
            $("#lrw-id-checkout__order-summary--shipping").hide();
            //$('#shippingList').find('option').not(':first').remove();
            $("#lrw-id-checkout__order-summary--subtotal-price").text('-');

            $('.lrw-c-side-nav__link__buy-qty').text(qtyTotal);
            $('.lrw-c-side-nav__link__buy-qty').removeClass('lrw-c-side-nav__link__buy-qty--visible');
        }


        if (planType === 'pro-monthly') {

            console.log('render planType monthly');

            $('.lrw-c-plan-annual').removeClass('lrw-c-plan__payment-interval--active');
            $('.lrw-c-plan-monthly').addClass('lrw-c-plan__payment-interval--active');
        } else {

            console.log('render planType annual');

            $('.lrw-c-plan-annual').addClass('lrw-c-plan__payment-interval--active');
            $('.lrw-c-plan-monthly').removeClass('lrw-c-plan__payment-interval--active');
        }





        if (planSelected === 'null' || planSelected === null || planSelected === undefined || planSelected === 'false') {

            console.log('render planSelected no');


            $('.lrw-c-cart__plan__checkbox').removeClass('lrw-c-cart__plan__checkbox--checked');
        } else if (plan === 'pro-annual') {

            console.log('render planSelected yes');


            $('.lrw-c-cart__plan__checkbox').addClass('lrw-c-cart__plan__checkbox--checked');
        }

    }

    /*function showLoader() {
        $('#loader').show();
    }*/

    /*function hideLoader() {
        $('#loader').hide();
    }*/

    /*async function getProducts() {
        const {data} = await axios.get(`${baseUrl}getProducts`);
        return data;
    }*/

    /*function setProductPrices(products, planPrice) {
        products.map(p => {
            //$(`#${p.colour}Name`).text(p.name);
            $(`#${p.colour}Price`).text(`$${p.price}`)
            //$(`#review-${p.colour}Name`).text(p.name);
        })
    }*/

    /*$('#lrw-id-checkout__summary--discount-button').click(async () => {
        showLoader();
        const coupon = $('#lrw-id-checkout__summary--discount').val();
        const {data} = await axios.get(`${baseUrl}applyCoupon?name=${coupon.toLowerCase()}`);

        if (!data.success) {
            $("#invalid-coupon").show();
            //$("#lrw-id-checkout__order-summary--discount--applied").hide();
            $("#lrw-id-checkout__summary--discount-button").show();
            $("#lrw-id-checkout__order-summary--discount--applied-price").hide();
            discountPercentage = 0;
        } else {
            $("#invalid-coupon").hide();
            discountPercentage = data.data.coupon[0].percent_off;
            //$("#lrw-id-checkout__order-summary--discount--applied").show();
            $("#lrw-id-checkout__summary--discount-button").hide();
            $("#lrw-id-checkout__order-summary--discount--applied-price").show();
        }
        updateCart();
        hideLoader();
    });*/

    /*$("#lrw-id-checkout__summary--discount").focus(function () {
        $('#invalid-coupon').hide();
        $("#lrw-id-checkout__summary--discount-button").show();
        $("#lrw-id-checkout__order-summary--discount--applied-price").hide();
    })*/

    updateCart();


});