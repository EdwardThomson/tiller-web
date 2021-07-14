$(document).ready(async function () {
    //showLoader();
    const baseUrl = 'https://ecommerce.gettiller.com/';
    const countryListUrl = 'https://restcountries.eu/rest/v2/all';

    const {data: countryList} = await axios.get(countryListUrl);
    countryList.map(c => $('#countryList').append(`<option value="${c.alpha2Code}">${c.name}</option>`));

    $('#lrw-id-checkout__qty--black,#lrw-id-checkout__qty--grey,#lrw-id-checkout__qty--silver,#lrw-id-checkout__qty--orange').attr('disabled', 'disabled');

    $('#loaderContainer,#errorContainer,#failed,#success,#failed-form,#success-form').hide();
    $('#payment-form').attr('method', null);

    $('#failed-form,#success-form').remove();

    //$('#lrw-id-checkout__order-summary--discount--applied').append(`<span class="span" id="remove-btn"><div class="remove-btn"></div>Remove</span>`).hide();
    $('#lrw-id-checkout__order-summary--discount').append(`<p class="error-msg" id="invalid-coupon" style="display: none;">Invalid Coupon</p>`);
    $('#shippingParent').append(`<p class="ship-error-msg" id="invalidShipping" style="display: none;">Postal code and Country are mandatory</p>`);

    //const {data: {products, planPrice, planPriceId}} = await getProducts();
    //products.map(item => $(`#${item.colour}Img`).attr("src", item.image));

    //$('#plan-id').val(planPriceId);
    //setProductPrices(products, planPrice);

    //hideLoader();

    //const priceBlack = parseFloat(products.find(e => e.colour === 'black').price.toFixed(2));
    //const priceGrey = parseFloat(products.find(e => e.colour === 'grey').price.toFixed(2));
    //const priceSliver = parseFloat(products.find(e => e.colour === 'silver').price.toFixed(2));
    //const priceOrange = parseFloat(products.find(e => e.colour === 'orange').price.toFixed(2));

    var discountPercentage = 0;
    var gstPercentage = 0;
    var shippingCharge = null;

    //var step;

    var items = [];

    const orderSummaryRowBlack = $('#lrw-id-checkout__order-summary--black');
    const orderSummaryRowGrey = $('#lrw-id-checkout__order-summary--grey');
    const orderSummaryRowSilver = $('#lrw-id-checkout__order-summary--silver');
    const orderSummaryRowOrange = $('#lrw-id-checkout__order-summary--orange');
    
    setStep(1);

    $('#step1-continue').click(async function(e) {
        e.preventDefault();

        $('#first_name').removeClass('lrw-c-form__input--error');
        $('#last_name').removeClass('lrw-c-form__input--error');
        $('#company').removeClass('lrw-c-form__input--error');
        $('#phone').removeClass('lrw-c-form__input--error');
        $('#address1').removeClass('lrw-c-form__input--error');
        $('#address2').removeClass('lrw-c-form__input--error');
        $('#city').removeClass('lrw-c-form__input--error');
        $('#state').removeClass('lrw-c-form__input--error');
        $('#postal_code').removeClass('lrw-c-form__input--error');
        $('#countryList').removeClass('lrw-c-form__input--error');
        $('#email').removeClass('lrw-c-form__input--error');

        if(!$('#first_name')[0].checkValidity()) {

            $('#first_name').addClass('lrw-c-form__input--error');

        } else if(!$('#last_name')[0].checkValidity()) {

            $('#last_name').addClass('lrw-c-form__input--error');

        } else if(!$('#company')[0].checkValidity()) {

            $('#company').addClass('lrw-c-form__input--error');

        } else if(!$('#address1')[0].checkValidity()) {

            $('#address1').addClass('lrw-c-form__input--error');

        } else if(!$('#address2')[0].checkValidity()) {

            $('#address2').addClass('lrw-c-form__input--error');

        } else if(!$('#city')[0].checkValidity()) {

            $('#city').addClass('lrw-c-form__input--error');

        } else if(!$('#countryList')[0].checkValidity()) {

            $('#countryList').addClass('lrw-c-form__input--error');

        } else if(!$('#state')[0].checkValidity()) {

            $('#state').addClass('lrw-c-form__input--error');

        } else if(!$('#postal_code')[0].checkValidity()) {

            $('#postal_code').addClass('lrw-c-form__input--error');

        } else if(!$('#phone')[0].checkValidity()) {

            $('#phone').addClass('lrw-c-form__input--error');

        } else if (!$('#email')[0].checkValidity()) {

            $('#email').addClass('lrw-c-form__input--error');

        } else {

            $('#reviewShippingTo').text(`${$('#first_name').val()} ${$('#last_name').val()}, ${$('#address1').val()}, ${$('#city').val()}, ${$('#state').val()}, ${$('#countryList').val()}`);
            //$('#reviewEmail').text($('#email').val());

            await getShipments();
            setStep(2);

            gtag('event', 'checkout_progress_1', {
                "items": items
            });

        }

    });

    $('#step2-continue').click(function(e) {
        e.preventDefault();

        shippingCharge = $("input[name=shippingOptions]:checked").val();
        courierName = $("input[name=shippingOptions]:checked").attr('courier_name');

        if(shippingCharge == null || courierName == null) {

            //$("input[name=shippingOptions]").addClass();

        } else {
            $('#reviewShippingMethodName').text(courierName);
            $('#reviewShippingMethodPrice').text('$' + addZeroes(shippingCharge));

            setStep(3);

            gtag('event', 'checkout_progress_2', {
                "items": items
            });

        }
    });

    $('#edit1').click(function() {
        setStep(1);
    });

    $('#edit2').click(function() {
        setStep(2);
    });

    $('#shippingOptionsContainer').on('change', 'input[name=shippingOptions]:radio', async function () {
        if ($("input[name=shippingOptions]:checked").val()) {
            shippingCharge = $("input[name=shippingOptions]:checked").val() || 0;
        } else {
            shippingCharge = 0;
        }
        updateCheckout();
    });

    $('#lrw-id-checkout__summary--discount-button').click(async () => {
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
        updateCheckout();
        hideLoader();
    });



    $(document).keypress(function(e) {
        if(e.which == 13) {
            e.preventDefault();

            const step = getStep();

            if (step === 1) {
                $('#step1-continue').click();
            } else if (step === 2 ) {
                $('#step2-continue').click();
            } else if (step === 3 ) {
                $('#payment-form').submit();
            }
        }
    });

    function addZeroes(num) {

        var value = Number(String(num));
        var res = String(num).split(".");

        console.log('addZeroes', num, res);

        if (res.length == 1 || res[1].length < 3) {
            value = value.toFixed(2);
        }
        return value;
    }

    function getIsPlanSelected() {

        console.log('getIsPlanSelected');

        var storedPlanSelected = Cookies.get('_lrc-is-plan-selected');
        if (storedPlanSelected === undefined) {
            return null;
        }

        console.log('getIsPlanSelected', storedPlanSelected);

        return storedPlanSelected;
    }

    function getPlanType() {
        var storedPlanType = Cookies.get('_lrc-plan-type');
        if (storedPlanType === undefined) {
            return 'pro-annual';
        }


        return storedPlanType;
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

    async function setStep(step) {
        //var lastStep = getStep();
        Cookies.set('_lrc-step', step);
        await updateCheckout();

        //if (step > lastStep) {
        //    $([document.documentElement, document.body]).animate({ scrollTop: $(`#step${lastStep}`).offset().top }, 0);
        //}
    
        //$([document.documentElement, document.body]).delay(800).animate({ scrollTop: $(`#step${step}`).offset().top }, 600);

    }

    function getStep() {
        var step = Cookies.get('_lrc-step');
        if (step === undefined) {
            return 1;
        }
        return parseInt(step, 10);
    }

    function showLoader() {
        $('#loader').show();
    }

    function hideLoader() {
        $('#loader').hide();
    }

    function updateCheckout() {

        console.log('updateCheckout Checkout');

        const qtyBlack = getQty('black');
        const qtyGrey = getQty('grey');
        const qtySilver = getQty('silver');
        const qtyOrange = getQty('orange');

        const qtyTotal = qtyBlack + qtyGrey + qtySilver + qtyOrange;

        //console.log('updateCheckout qtyTotal bug', qtyTotal);

        planSelected = getIsPlanSelected();
        planType = getPlanType();

        const step = getStep();
        const steps = [1,2,3];

        gstPercentage = $("#countryList option:selected").val() === 'AU' ? 10 : 0;
        shippingCharge = $("input[name=shippingOptions]:checked").val() || 0;

        items = [];

        var devicePriceCart = 149;
        var planPrice = 0;
        var devicePriceId = 'price_1GwkJwK4V9WJjdPvMzFudSRT';
        var planPriceId = null;
        var subscriptionPrice = 0;

        if (planSelected === 'true') {
            if (planType === 'pro-monthly') {
                $('.lrw-c-plan-annual').removeClass('lrw-c-plan__payment-interval--active');
                $('.lrw-c-plan-monthly').addClass('lrw-c-plan__payment-interval--active');
                devicePriceCart = 129;
                planPrice = 8;
                devicePriceId = 'price_1GwkK8K4V9WJjdPvLaCME1g5';
                planPriceId = 'price_1GwkLzK4V9WJjdPvb9EX7Ktw';
                subscriptionPrice = parseFloat((qtyTotal * planPrice).toFixed(2));
                $("#lrw-id-summary__total-plan-description").text(`$${planPrice}/month, billed monthly`);
            } else if (planType === 'pro-annual') {
                $('.lrw-c-plan-annual').addClass('lrw-c-plan__payment-interval--active');
                $('.lrw-c-plan-monthly').removeClass('lrw-c-plan__payment-interval--active');
                devicePriceCart = 99;
                planPrice = 6;
                devicePriceId = 'price_1GwkKJK4V9WJjdPvEzkUGv40';
                planPriceId = 'price_1GwkMEK4V9WJjdPv13JDdwMH';
                subscriptionPrice = parseFloat((12 * qtyTotal * planPrice).toFixed(2));
                $("#lrw-id-summary__total-plan-description").text(`$${planPrice}/month, billed annually`);
            }
            $('.lrw-c-cart__plan__checkbox').addClass('lrw-c-cart__plan__checkbox--checked');
            $('#lrw-id-plan-name__container').removeClass('lrw-c-plan-name__container--hidden');
            $('#lrw-id-summary__total-plan').removeClass('lrw-c-cart__plan__price--hidden');
            $('#lrw-id-checkout-plan').removeClass('lrw-c-cart__add--hidden');
            $('#lrw-id-summary__total-plan').text(`$${addZeroes(subscriptionPrice)}`);
        } else {
            $('.lrw-c-cart__plan__checkbox').removeClass('lrw-c-cart__plan__checkbox--checked');
            $('#lrw-id-plan-name__container').addClass('lrw-c-plan-name__container--hidden');
            $('#lrw-id-summary__total-plan').addClass('lrw-c-cart__plan__price--hidden');
            $('#lrw-id-checkout-plan').addClass('lrw-c-cart__add--hidden');
        }

        const productPrice = parseFloat(((qtyTotal * devicePriceCart)).toFixed(2));
        const subtotalPrice = productPrice + subscriptionPrice;

        //productPrice = parseFloat(((qtyBlack * priceBlack) + (qtyGrey * priceGrey) + (qtySilver * priceSliver) + (qtyOrange * priceOrange)).toFixed(2))
        //subscriptionPrice = parseFloat((qtyTotal * 12 * planPrice).toFixed(2));
        const discountPrice = parseFloat(((productPrice + subscriptionPrice) * (discountPercentage / 100)).toFixed(2));
        const gstPrice = parseFloat(((productPrice + subscriptionPrice - discountPrice) * (gstPercentage / 100)).toFixed(2));

        if (gstPercentage === 0) {
            $('#lrw-id-checkout__order-summary--gst').hide();
        } else {
            $('#lrw-id-checkout__order-summary--gst').show();
        }

        if (discountPrice === 0) {
            //$("#lrw-id-checkout__order-summary--discount--applied").hide();
            $("#lrw-id-checkout__summary--discount-button").show();
            $("#lrw-id-checkout__order-summary--discount--applied-price").hide();
        } else {
            //$("#lrw-id-checkout__order-summary--discount--applied").show();
            $("#lrw-id-checkout__summary--discount-button").hide();
            $("#lrw-id-checkout__order-summary--discount--applied-price").show();
        }

        $('#lrw-id-checkout__order-summary--gst-price').text(`$${addZeroes(gstPrice)}`);
        $('#lrw-id-checkout__order-summary--gst-label').text(`GST (${gstPercentage}%)`);
        $("#lrw-id-checkout__order-summary--discount--applied-price").text(`-$${addZeroes(discountPrice)}`);

        $('#lrw-id-checkout__qty--black').val(qtyBlack);
        $('#lrw-id-checkout__qty--grey').val(qtyGrey);
        $('#lrw-id-checkout__qty--silver').val(qtySilver);
        $('#lrw-id-checkout__qty--orange').val(qtyOrange);

        $('#lrw-id-checkout__summary__qty--black').text(qtyBlack + " x ");
        $('#lrw-id-checkout__summary__qty--grey').text(qtyGrey + " x ");
        $('#lrw-id-checkout__summary__qty--silver').text(qtySilver + " x ");
        $('#lrw-id-checkout__summary__qty--orange').text(qtyOrange + " x ");

        steps.map(s => {

            if (s < step) {
                //', 'initial');
                //$(`#step${s}`).css('padding-bottom', '0px');
                $(`#step${s} .lrw-c-checkout__section__entry`).hide();
                $(`#step${s} .lrw-c-checkout__section__complete`).fadeIn(200);
            } else if (s === step) {
                //$(`#step${s}`).css('min-height', '100vh');
                //$(`#step${s}`).css('padding-bottom', '148px');
                $(`#step${s} .lrw-c-checkout__section__entry`).delay(200).fadeIn(200);
                $(`#step${s} .lrw-c-checkout__section__complete`).hide();
            } else if (s > step) {
                //$(`#step${s}`).css('min-height', 'initial');
                //$(`#step${s}`).css('padding-bottom', '0px');
                $(`#step${s} .lrw-c-checkout__section__entry`).hide();
                $(`#step${s} .lrw-c-checkout__section__complete`).hide();
            }

        })


        if (qtyBlack > 0) {
            orderSummaryRowBlack.removeClass('lrw-c-checkout__order-summary--hidden');
            $('#lrw-id-summary__total-device--black').text(`$${addZeroes(parseFloat((qtyBlack * devicePriceCart).toFixed(2)))}`);

            items.push({
                "id": 'black',
                "name": "T1.01",
                "brand": "Tiller",
                "variant": 'black',
                "quantity": qtyBlack,
                "price": `${135 * qtyBlack}`
            });

        } else {
            orderSummaryRowBlack.addClass('lrw-c-checkout__order-summary--hidden');
        }
        if (qtyGrey > 0) {
            orderSummaryRowGrey.removeClass('lrw-c-checkout__order-summary--hidden');
            $('#lrw-id-summary__total-device--grey').text(`$${addZeroes(parseFloat((qtyGrey * devicePriceCart).toFixed(2)))}`);

            items.push({
                "id": 'grey',
                "name": "T1.01",
                "brand": "Tiller",
                "variant": 'grey',
                "quantity": qtyGrey,
                "price": `${135 * qtyGrey}`
            });

        } else {
            orderSummaryRowGrey.addClass('lrw-c-checkout__order-summary--hidden');
        }
        if (qtySilver > 0) {
            orderSummaryRowSilver.removeClass('lrw-c-checkout__order-summary--hidden');
            $('#lrw-id-summary__total-device--silver').text(`$${addZeroes(parseFloat((qtySilver * devicePriceCart).toFixed(2)))}`);

            items.push({
                "id": 'silver',
                "name": "T1.01",
                "brand": "Tiller",
                "variant": 'silver',
                "quantity": qtySilver,
                "price": `${135 * qtySilver}`
            });

        } else {
            orderSummaryRowSilver.addClass('lrw-c-checkout__order-summary--hidden');
        }
        if (qtyOrange > 0) {
            orderSummaryRowOrange.removeClass('lrw-c-checkout__order-summary--hidden');
            $('#lrw-id-summary__total-device--orange').text(`$${addZeroes(parseFloat((qtyOrange * devicePriceCart).toFixed(2)))}`);

            items.push({
                "id": 'orange',
                "name": "T1.01",
                "brand": "Tiller",
                "variant": 'orange',
                "quantity": qtyOrange,
                "price": `${135 * qtyOrange}`
            });

        } else {
            orderSummaryRowOrange.addClass('lrw-c-checkout__order-summary--hidden');
        }
        if (qtyTotal > 0) {
            let totalPrice = (parseFloat(((productPrice - discountPrice) + gstPrice + subscriptionPrice).toFixed(2)) + parseFloat(shippingCharge)).toFixed(2);
            $('#lrw-id-checkout__qty--total').text(`${qtyTotal}`);
            $('#lrw-id-summary__total').text(`USD $${addZeroes(totalPrice)}`);
            $('#lrw-id-btn__checkout').removeClass('lrw-c-button--disabled').attr("disabled", false);
            $('#lrw-id-checkout__order-summary--subscription').show();
            $("#checkout-pay-btn").val(`Pay USD $${addZeroes(totalPrice)}`).attr("disabled", false);
            $('#lrw-id-checkout__order-summary--shipping-price').text(`${addZeroes(shippingCharge) ? '$' + addZeroes(shippingCharge) : 'Calculated on next step'}`);
            $("#lrw-id-checkout__order-summary--shipping").show();
            $("#lrw-id-checkout__order-summary--subtotal-price").text(`$${addZeroes(subtotalPrice)}`);
            $('#priceid').val(devicePriceId);
            $('#plan').val(planPriceId);

        } else {
            $('#lrw-id-checkout__order-summary--subscription').hide();
            //$('#lrw-id-summary__total-plan').text('-');
            $('#lrw-id-checkout__qty--total').text('-');
            $('#lrw-id-summary__total').text('-');
            $('#lrw-id-btn__checkout').addClass('lrw-c-button--disabled').attr("disabled", true);
            $("#checkout-pay-btn").val(`Pay`).attr("disabled", true);
            $("#lrw-id-checkout__order-summary--shipping").hide();
            //$('#shippingList').find('option').not(':first').remove();
            $("#lrw-id-checkout__order-summary--subtotal-price").text('-');
        }
    }

    $("#lrw-id-checkout__summary--discount").focus(function () {
        $('#invalid-coupon').hide();
        $("#lrw-id-checkout__summary--discount-button").show();
        $("#lrw-id-checkout__order-summary--discount--applied-price").hide();
    });

    async function submitOrder(token) {
        var $inputs = $('#payment-form :input');
        var values = {};
        $inputs.each(function () {
            values[this.name] = $(this).val();
        });

        //values.courier_id = $("#shippingList option:selected").attr('courier_id');
        values.courier_id = $("input[name=shippingOptions]:checked").attr('courier_id');

        try {
            const data = await axios.post(`${baseUrl}submitOrder`, {...values, token});

            console.log('submitOrder response', data);

            if (data.data.success) {

                $("#payment-form").hide();
                $("#success").show();

                console.log('value', $('#lrw-id-summary__total').text());
                console.log('tax', $('#lrw-id-checkout__order-summary--gst-price').text());
                console.log('shipping', $('#lrw-id-checkout__order-summary--shipping-price').text())
                console.log('items', items);

                gtag('event', 'purchase', {
                    "transaction_id": "0",
                    "affiliation": "Tiller Website",
                    "value": $('#lrw-id-summary__total').text(),
                    "currency": "USD",
                    "tax": $('#lrw-id-checkout__order-summary--gst-price').text(),
                    "shipping": $('#lrw-id-checkout__order-summary--shipping-price').text(),
                    "items": items
                });

                setQty('black', 0);
                setQty('grey', 0);
                setQty('silver', 0);
                setQty('orange', 0);

            }
        } catch (e) {

            console.log('payment failed', e);
            $("#payment-form").hide();
            $("#failed").show();
        }
    }

    var stripe = Stripe('pk_live_8uFAeDRxD1j1sNuYvptjG3mm');

    var elements = stripe.elements();

    var style = {
        base: {
            color: '#000',
            fontFamily: 'inherit',
            fontSmoothing: 'antialiased',
            fontSize: '20px',
            lineHeight: '28px',
            '::placeholder': {
                color: 'rgba(0,0,0,0.6)'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    };

    var card = elements.create('card', {style: style, hidePostalCode: true});
    card.mount('#card-element');

    card.addEventListener('change', function ({error}) {
        var displayError = document.getElementById('card-errors');
        if (error) {
            const message = error.code === 'invalid_expiry_year_past' ? 'Your card is Expired.' : error.message;
            displayError.textContent = message;
        } else {
            displayError.textContent = '';
        }
    });

    var form = document.getElementById('payment-form');
    form.addEventListener('submit', function (event) {

        event.preventDefault(event);

        if (getStep() === 3) {
            showLoader();
            stripe.createToken(card).then(async function (result) {
                if (result.error) {
                    var errorElement = document.getElementById('card-errors');
                    errorElement.textContent = result.error.message;
                    hideLoader()
                } else {
                    await submitOrder(result.token.id);
                    hideLoader()
                }
            });
        }
    });

    async function getShipments() {

        const qtyBlack = getQty('black');
        const qtyGrey = getQty('grey');
        const qtySilver = getQty('silver');
        const qtyOrange = getQty('orange');

        const qtyTotal = qtyBlack + qtyGrey + qtySilver + qtyOrange;

        console.log('getShipments qtyTotal', qtyTotal);


        if (qtyTotal > 0) {
            $("#invalidShipping").hide();
            //$('#shippingList').find('option').not(':first').remove();

            showLoader();
            const payload = {
                countryCode: $("#countryList option:selected").val(),
                postalCode: $("#postal_code").val(),
                qtyBlack,
                qtyGrey,
                qtySilver,
                qtyOrange,
                qtyTotal,
                address1: $('#address1').val(),
                address2: $('#address2').val(),
                city: $('#city').val(),
                state: $('#state').val(),
            };

            const {data} = await axios.post(`${baseUrl}getShipments`, {...payload});

            if (!data.success) {
                console.log('getShipments failure', data);
                $("#invalidShipping").show()
            } else {
                if (!data.data.rates.length) {
                    $("#invalidShipping").show();
                    $('#shippingOptionsContainer').html("");
                } else {
                    $("#invalidShipping").hide();
                    $('#shippingOptionsContainer').html("");

                    console.log('getShipments data', data);

                    data.data.rates.map(r => {

                        //$('#shippingList').append(`<option courier_id="${r.courier_id}" value="${r.total_charge}">${r.courier_name}  $${r.total_charge}</option>`);

                        if (r.cost_rank === 1 || r.value_for_money_rank === 1 || r.delivery_time_rank === 1) {

                            $('#shippingOptionsContainer').append(`<label class="lrw-c-checkout__radio-button-field w-radio">
                                <input type="radio" data-name="shippingOptions" courier_name="${r.courier_name}" courier_id="${r.courier_id}" name="shippingOptions" value="${r.total_charge}" class="w-form-formradioinput lrw-c-checkout__radio-button w-radio-input"/>
                                <span class="lrw-c-checkout__radio-label w-form-label">${r.courier_name}</span>
                                <span class="lrw-c-checkout__radio-expected-delivery w-form-label">${r.min_delivery_time} - ${r.max_delivery_time} business days</span>
                                <span class="lrw-c-checkout__radio-price w-form-label">$${addZeroes(r.total_charge)}</span>
                            </label>`);

                        }

                    });
                }
            }
            hideLoader();
        }
    }

});