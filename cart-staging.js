$(document).ready(async function () {

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
        var planSetSelected = getIsPlanSelected();

        if (planSetSelected === 'null' || planSetSelected === null || planSetSelected === undefined || planSetSelected === 'false') {
            setIsPlanSelected('true');
        } else {
            setIsPlanSelected('false');
        }
    });

    $('.lrw-c-plan-annual').click(function(e) {
        e.stopPropagation();
        setPlanType('pro-annual');
    });

    $('.lrw-c-plan-monthly').click(function(e) {
        e.stopPropagation();
        setPlanType('pro-monthly');
    });

    $('#lrw-id-buy-with-plan').click(function() {
        setIsPlanSelected('true');
    });

    $('#lrw-id-buy-without-plan').click(function() {
        setIsPlanSelected('false');
    });

    function addZeroes(num) {
        var value = Number(String(num));
        var res = String(num).split(".");
        if (res.length > 1 && res[1].length < 3) {
            value = value.toFixed(2);
        }
        return value;
    }

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

        qtyBlack = getQty('black');
        qtyGrey = getQty('grey');
        qtySilver = getQty('silver');
        qtyOrange = getQty('orange');
        qtyTotal = qtyBlack + qtyGrey + qtySilver + qtyOrange;

        planSelected = getIsPlanSelected();
        planType = getPlanType();

        items = [];

        var devicePrice = 179;
        var planPrice = 8;

        var subscriptionPrice = 0;

        


        if (planType === 'pro-monthly') {
            $('.lrw-c-plan-annual').removeClass('lrw-c-plan__payment-interval--active');
            $('.lrw-c-plan-monthly').addClass('lrw-c-plan__payment-interval--active');

            if (planSelected === 'true') {
                planPrice = 8;
            }

        } else if (planType === 'pro-annual') {
            $('.lrw-c-plan-annual').addClass('lrw-c-plan__payment-interval--active');
            $('.lrw-c-plan-monthly').removeClass('lrw-c-plan__payment-interval--active');

            if (planSelected === 'true') {
                devicePrice = 129;
                planPrice = 6;
            }

        }

        if (planSelected === 'true') {
            $('.lrw-c-cart__plan__checkbox').addClass('lrw-c-cart__plan__checkbox--checked');
            subscriptionPrice = parseFloat((qtyTotal * 12 * planPrice).toFixed(2));
        } else {
            $('.lrw-c-cart__plan__checkbox').removeClass('lrw-c-cart__plan__checkbox--checked');
        }

        productPrice = parseFloat(((qtyTotal * devicePrice)).toFixed(2));
        subtotalPrice = productPrice + subscriptionPrice;

        $('#lrw-id-checkout__qty--black').val(qtyBlack);
        $('#lrw-id-checkout__qty--grey').val(qtyGrey);
        $('#lrw-id-checkout__qty--silver').val(qtySilver);
        $('#lrw-id-checkout__qty--orange').val(qtyOrange);

        orderSummaryRowBlack.addClass('lrw-c-cart__add--hidden');
        orderSummaryRowGrey.addClass('lrw-c-cart__add--hidden');
        orderSummaryRowSilver.addClass('lrw-c-cart__add--hidden');
        orderSummaryRowOrange.addClass('lrw-c-cart__add--hidden');

        if (qtyBlack > 0) {
            orderSummaryRowBlack.removeClass('lrw-c-cart__add--hidden');
            $('#lrw-id-summary__total-device--black').text(`$${addZeroes(parseFloat((qtyBlack * devicePrice).toFixed(2)))}`);

            items.push({
                "id": 'black',
                "name": "T1.01",
                "brand": "Tiller",
                "variant": 'black',
                "quantity": qtyBlack,
                "price": `${135 * qtyBlack}`
            });

        }

        if (qtyGrey > 0) {
            orderSummaryRowGrey.removeClass('lrw-c-cart__add--hidden');
            $('#lrw-id-summary__total-device--grey').text(`$${addZeroes(parseFloat((qtyGrey * devicePrice).toFixed(2)))}`);

            items.push({
                "id": 'grey',
                "name": "T1.01",
                "brand": "Tiller",
                "variant": 'grey',
                "quantity": qtyGrey,
                "price": `${135 * qtyGrey}`
            });

        } 

        if (qtySilver > 0) {
            orderSummaryRowSilver.removeClass('lrw-c-cart__add--hidden');
            $('#lrw-id-summary__total-device--silver').text(`$${addZeroes(parseFloat((qtySilver * devicePrice).toFixed(2)))}`);

            items.push({
                "id": 'silver',
                "name": "T1.01",
                "brand": "Tiller",
                "variant": 'silver',
                "quantity": qtySilver,
                "price": `${135 * qtySilver}`
            });

        } 

        if (qtyOrange > 0) {
            orderSummaryRowOrange.removeClass('lrw-c-cart__add--hidden');
            $('#lrw-id-summary__total-device--orange').text(`$${addZeroes(parseFloat((qtyOrange * devicePrice).toFixed(2)))}`);

            items.push({
                "id": 'orange',
                "name": "T1.01",
                "brand": "Tiller",
                "variant": 'orange',
                "quantity": qtyOrange,
                "price": `${135 * qtyOrange}`
            });

        } 
        
        if (qtyTotal > 0) {

            let totalPrice = (parseFloat(((productPrice) + subscriptionPrice).toFixed(2))).toFixed(2);
            $('#lrw-id-summary__total-plan').text(`$${planPrice}/month`);
            //$('#lrw-id-checkout__qty--total').text(`${qtyTotal}`);
            $('#lrw-id-summary__total').text(`USD $${addZeroes(totalPrice)}`);
            $('#lrw-id-btn__checkout').removeClass('lrw-c-button--disabled').attr("disabled", false);
            $('#lrw-id-checkout__order-summary--subscription').show();
            //$("#checkout-pay-btn").val(`Pay USD $${addZeroes(totalPrice)}`).attr("disabled", false);
            $("#lrw-id-checkout__order-summary--subtotal-price").text('$' + addZeroes(subtotalPrice));

            $('.lrw-c-side-nav__link__buy-qty').text(qtyTotal);
            $('.lrw-c-side-nav__link__buy-qty').addClass('lrw-c-side-nav__link__buy-qty--visible');

            $('.lrw-c-cart__plan').removeClass('lrw-c-cart__plan--hidden');
            $('.lrw-c-cart__footer').removeClass('lrw-c-cart__footer--hidden');

        } else {

            $('#lrw-id-checkout__order-summary--subscription').hide();
            $('#lrw-id-summary__total-plan').text('-');
            //$('#lrw-id-checkout__qty--total').text('-');
            $('#lrw-id-summary__total').text('-');
            $('#lrw-id-btn__checkout').addClass('lrw-c-button--disabled').attr("disabled", true);
            //$("#checkout-pay-btn").val(`Pay`).attr("disabled", true);
            $("#lrw-id-checkout__order-summary--shipping").hide();
            //$('#shippingList').find('option').not(':first').remove();
            $("#lrw-id-checkout__order-summary--subtotal-price").text('-');

            $('.lrw-c-side-nav__link__buy-qty').text(qtyTotal);
            $('.lrw-c-side-nav__link__buy-qty').removeClass('lrw-c-side-nav__link__buy-qty--visible');

            $('.lrw-c-cart__plan').addClass('lrw-c-cart__plan--hidden');
            $('.lrw-c-cart__footer').addClass('lrw-c-cart__footer--hidden');

        }

    }

    updateCart();


});