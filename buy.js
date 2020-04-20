$(document).ready(async function () {
    showLoader();
    const baseUrl = 'https://ecommerce.gettiller.com/';
    const apiUrl = 'https://restcountries.eu/rest/v2/all';

    $('#lrw-id-checkout__qty--black,#lrw-id-checkout__qty--grey,#lrw-id-checkout__qty--silver,#lrw-id-checkout__qty--orange').attr('disabled', 'disabled');

    $('#loaderContainer,#errorContainer,#failed,#success,#failed-form,#success-form').hide();
    $('#payment-form').attr('method', null);

    $('#failed-form,#success-form').remove();

    //$('#lrw-id-checkout__order-summary--discount--applied').append(`<span class="span" id="remove-btn"><div class="remove-btn"></div>Remove</span>`).hide();
    $('#lrw-id-checkout__order-summary--discount').append(`<p class="error-msg" id="invalid-coupon" style="display: none;">Invalid Coupon</p>`);
    $('#shippingParent').append(`<p class="ship-error-msg" id="invalidShipping" style="display: none;">Postal code and Country are mandatory</p>`);

    const {data: {products, planPrice, planId}} = await getProducts();
    products.map(item => $(`#${item.colour}Img`).attr("src", item.image));
    $('#plan-id').val(planId);
    setProductPrices(products, planPrice);

    hideLoader();

    function addZeroes(num) {
        var value = Number(String(num));
        var res = String(num).split(".");
        if (res.length > 1 && res[1].length < 3) {
            value = value.toFixed(2);
        }
        return value;
    }

    $("#lrw-id-summary__total-plan-description").text(`$${planPrice}/month, billed annually`);

    const priceBlack = parseFloat(products.find(e => e.colour === 'black').price.toFixed(2));
    const priceGrey = parseFloat(products.find(e => e.colour === 'grey').price.toFixed(2));
    const priceSliver = parseFloat(products.find(e => e.colour === 'silver').price.toFixed(2));
    const priceOrange = parseFloat(products.find(e => e.colour === 'orange').price.toFixed(2));

    var discountPercentage = 0;
    var gstPercentage = 0;
    var shippingCharge = null;

    var qtyBlack;
    var qtyGrey;
    var qtySilver;
    var qtyOrange;

    var step;

    var items = [];

    const colourSelectBlack = $('#lrw-id-checkout__colour-select--black');
    const colourSelectGrey = $('#lrw-id-checkout__colour-select--grey');
    const colourSelectSilver = $('#lrw-id-checkout__colour-select--silver');
    const colourSelectOrange = $('#lrw-id-checkout__colour-select--orange');
    const orderSummaryRowBlack = $('#lrw-id-checkout__order-summary--black');
    const orderSummaryRowGrey = $('#lrw-id-checkout__order-summary--grey');
    const orderSummaryRowSilver = $('#lrw-id-checkout__order-summary--silver');
    const orderSummaryRowOrange = $('#lrw-id-checkout__order-summary--orange');
    
    setStep(1);

    $('#lrw-id-checkout__colour-select--black').click(function () {
        if (qtyBlack === 0) {
            incrementQty('black');
        }
    });

    $('#lrw-id-checkout__colour-select--grey').click(function () {
        if (qtyGrey === 0) {
            incrementQty('grey', 1);
        }
    });

    $('#lrw-id-checkout__colour-select--silver').click(function () {
        if (qtySilver === 0) {
            incrementQty('silver', 1);
        }
    });

    $('#lrw-id-checkout__colour-select--orange').click(function () {
        if (qtyOrange === 0) {
            incrementQty('orange', 1);
        }
    });

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

    $(document).keypress(function(e) {
        if(e.which == 13) {
            e.preventDefault();

            const step = getStep();

            if (step === 1) {
                $('#step1-continue').click();
            } else if (step === 2 ) {
                $('#step2-continue').click();
            } else if (step === 3 ) {
                $('#step3-continue').click();
            } else if (step === 4 ) {
                $('#step4-continue').click();
            } else if (step === 5 ) {
                $('#payment-form').submit();
            }
        }
    });

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

    function decrementQty(variant) {
        var qty = getQty(variant);
        if (qty > 0) {
            qty--;
        } else {
            qty = 0;
        }
        setQty(variant, qty);

        gtag('event', 'remove_from_cart', {
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

    async function setStep(step) {
        var lastStep = getStep();
        Cookies.set('_lrc-step', step);
        await updateCheckout();

        if (step > lastStep) {
            $([document.documentElement, document.body]).animate({ scrollTop: $(`#step${lastStep}`).offset().top }, 0);
        }
    
        $([document.documentElement, document.body]).delay(800).animate({ scrollTop: $(`#step${step}`).offset().top }, 600);

    }

    function getStep() {
        var step = Cookies.get('_lrc-step');
        if (step === undefined) {
            return 1;
        }
        return parseInt(step, 10);
    }

    $('#step1-continue').click(function(e) {
        e.preventDefault();
        if(qtyTotal > 0) {
            setStep(2);

            gtag('event', 'begin_checkout', {
                "items": items
            });

        }

    });

    $('#step2-continue').click(function(e) {
        e.preventDefault();

        if (!$('#email')[0].checkValidity()) {
            $('#email').addClass('lrw-c-form__input--error');
        } else {
            $('#reviewEmail').text($('#email').val());
            $('#email').removeClass('lrw-c-form__input--error');
            setStep(3);

            gtag('event', 'checkout_progress', {
                "items": items
            });

        }
    });

    $('#step3-continue').click(async function(e) {
        e.preventDefault();

        $('#name').removeClass('lrw-c-form__input--error');
        $('#company').removeClass('lrw-c-form__input--error');
        $('#phone').removeClass('lrw-c-form__input--error');
        $('#address1').removeClass('lrw-c-form__input--error');
        $('#address2').removeClass('lrw-c-form__input--error');
        $('#city').removeClass('lrw-c-form__input--error');
        $('#state').removeClass('lrw-c-form__input--error');
        $('#postal_code').removeClass('lrw-c-form__input--error');
        $('#countryList').removeClass('lrw-c-form__input--error');

        if(!$('#name')[0].checkValidity()) {

            $('#name').addClass('lrw-c-form__input--error');

        } else if(!$('#company')[0].checkValidity()) {

            $('#company').addClass('lrw-c-form__input--error');

        } else if(!$('#phone')[0].checkValidity()) {

            $('#phone').addClass('lrw-c-form__input--error');

        } else if(!$('#address1')[0].checkValidity()) {

            $('#address1').addClass('lrw-c-form__input--error');

        } else if(!$('#address2')[0].checkValidity()) {

            $('#address2').addClass('lrw-c-form__input--error');

        } else if(!$('#city')[0].checkValidity()) {

            $('#city').addClass('lrw-c-form__input--error');

        } else if(!$('#state')[0].checkValidity()) {

            $('#state').addClass('lrw-c-form__input--error');

        } else if(!$('#postal_code')[0].checkValidity()) {

            $('#postal_code').addClass('lrw-c-form__input--error');

        } else if(!$('#countryList')[0].checkValidity()) {

            $('#countryList').addClass('lrw-c-form__input--error');

        } else {
            $('#reviewShippingTo').text(`${$('#name').val()}, ${$('#address1').val()}, ${$('#city').val()}, ${$('#state').val()}, ${$('#countryList').val()}`);

            await getShipments();
            setStep(4);

            gtag('event', 'checkout_progress', {
                "items": items
            });

        }

    });

    $('#step4-continue').click(function(e) {
        e.preventDefault();

        shippingCharge = $("input[name=shippingOptions]:checked").val();
        courierName = $("input[name=shippingOptions]:checked").attr('courier_name');

        if(shippingCharge == null || courierName == null) {

            //$("input[name=shippingOptions]").addClass();

        } else {
            $('#reviewShippingMethodName').text(courierName);
            $('#reviewShippingMethodPrice').text('$' + addZeroes(shippingCharge));

            setStep(5);

            gtag('event', 'checkout_progress', {
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

    $('#edit3').click(function() {
        setStep(3);
    });

    $('#edit4').click(function() {
        setStep(4);
    });

    function updateCheckout() {

        gstPercentage = $("#countryList option:selected").val() === 'AU' ? 10 : 0;
        shippingCharge = $("input[name=shippingOptions]:checked").val() || 0;

        qtyBlack = getQty('black');
        qtyGrey = getQty('grey');
        qtySilver = getQty('silver');
        qtyOrange = getQty('orange');
        qtyTotal = qtyBlack + qtyGrey + qtySilver + qtyOrange;

        step = getStep();
        steps = [1,2,3,4,5];

        items = [];

        productPrice = parseFloat(((qtyBlack * priceBlack) + (qtyGrey * priceGrey) + (qtySilver * priceSliver) + (qtyOrange * priceOrange)).toFixed(2))
        subscriptionPrice = parseFloat((qtyTotal * 12 * planPrice).toFixed(2));
        discountPrice = parseFloat(((productPrice + subscriptionPrice) * (discountPercentage / 100)).toFixed(2));
        gstPrice = parseFloat(((productPrice + subscriptionPrice - discountPrice) * (gstPercentage / 100)).toFixed(2));

        subtotalPrice = productPrice + subscriptionPrice;

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
                $(`#step${s}`).css('min-height', 'initial');
                $(`#step${s}`).css('padding-bottom', '0px');
                $(`#step${s} .lrw-c-checkout__section__entry`).hide();
                $(`#step${s} .lrw-c-checkout__section__complete`).fadeIn(200);
            } else if (s === step) {
                $(`#step${s}`).css('min-height', '100vh');
                $(`#step${s}`).css('padding-bottom', '148px');
                $(`#step${s} .lrw-c-checkout__section__entry`).delay(200).fadeIn(200);
                $(`#step${s} .lrw-c-checkout__section__complete`).hide();
            } else if (s > step) {
                $(`#step${s}`).css('min-height', 'initial');
                $(`#step${s}`).css('padding-bottom', '0px');
                $(`#step${s} .lrw-c-checkout__section__entry`).hide();
                $(`#step${s} .lrw-c-checkout__section__complete`).hide();
            }

        })


        if (qtyBlack > 0) {
            colourSelectBlack.addClass('lrw-c-checkout__colour-select--selected');
            orderSummaryRowBlack.removeClass('lrw-c-checkout__order-summary--hidden');
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
            colourSelectBlack.removeClass('lrw-c-checkout__colour-select--selected');
            orderSummaryRowBlack.addClass('lrw-c-checkout__order-summary--hidden');
        }
        if (qtyGrey > 0) {
            colourSelectGrey.addClass('lrw-c-checkout__colour-select--selected');
            orderSummaryRowGrey.removeClass('lrw-c-checkout__order-summary--hidden');
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
            colourSelectGrey.removeClass('lrw-c-checkout__colour-select--selected');
            orderSummaryRowGrey.addClass('lrw-c-checkout__order-summary--hidden');
        }
        if (qtySilver > 0) {
            colourSelectSilver.addClass('lrw-c-checkout__colour-select--selected');
            orderSummaryRowSilver.removeClass('lrw-c-checkout__order-summary--hidden');
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
            colourSelectSilver.removeClass('lrw-c-checkout__colour-select--selected');
            orderSummaryRowSilver.addClass('lrw-c-checkout__order-summary--hidden');
        }
        if (qtyOrange > 0) {
            colourSelectOrange.addClass('lrw-c-checkout__colour-select--selected');
            orderSummaryRowOrange.removeClass('lrw-c-checkout__order-summary--hidden');
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
            colourSelectOrange.removeClass('lrw-c-checkout__colour-select--selected');
            orderSummaryRowOrange.addClass('lrw-c-checkout__order-summary--hidden');
        }
        if (qtyTotal > 0) {
            let totalPrice = (parseFloat(((productPrice - discountPrice) + gstPrice + subscriptionPrice).toFixed(2)) + parseFloat(shippingCharge)).toFixed(2);
            $('#lrw-id-summary__total-plan').text(`$${qtyTotal * 12 * planPrice}`);
            $('#lrw-id-checkout__qty--total').text(`${qtyTotal}`);
            $('#lrw-id-summary__total').text(`USD $${addZeroes(totalPrice)}`);
            $('#lrw-id-btn__checkout').removeClass('lrw-c-button--disabled').attr("disabled", false);
            $('#lrw-id-checkout__order-summary--subscription').show();
            $("#checkout-pay-btn").val(`Pay USD $${addZeroes(totalPrice)}`).attr("disabled", false);
            $('#lrw-id-checkout__order-summary--shipping-price').text(`${addZeroes(shippingCharge) ? '$' + addZeroes(shippingCharge) : 'Not Selected'}`);
            $("#lrw-id-checkout__order-summary--shipping").show();
            $("#lrw-id-checkout__order-summary--subtotal-price").text('$' + addZeroes(subtotalPrice));
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
        }
    }

    function showLoader() {
        $('#loader').show();
    }

    function hideLoader() {
        $('#loader').hide();
    }

    async function getProducts() {
        const {data} = await axios.get(`${baseUrl}getProducts`);
        return data;
    }

    function setProductPrices(products, planPrice) {
        products.map(p => {
            //$(`#${p.colour}Name`).text(p.name);
            $(`#${p.colour}Price`).text(`$${p.price} + $${planPrice}/month`)
            //$(`#review-${p.colour}Name`).text(p.name);
        })
    }

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

    const {data: countryList} = await axios.get(apiUrl);
    countryList.map(c => $('#countryList').append(`<option value="${c.alpha2Code}">${c.name}</option>`));

    $('#countryList').change(async function () {
        //await getShipments();
        //updateCheckout();
    });

    /*$('#remove-btn').click(function () {
        discountPercentage = 0;
        $("#lrw-id-checkout__order-summary--discount--applied").hide();
        $('#lrw-id-checkout__summary--discount').val('');
        updateCheckout()
    });*/

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

        //return false;

        gtag('event', 'purchase', {
            "items": items
        });

        try {
            const data = await axios.post(`${baseUrl}submitOrder`, {...values, token});

            if (data.data.success) {

                $("#payment-form").hide();
                $("#success").show();

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

        if (getStep() === 5) {
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

        if (qtyTotal > 0) {
            $("#invalidShipping").hide();
            //$('#shippingList').find('option').not(':first').remove();

            showLoader();
            const payload = {
                countryCode: $("#countryList option:selected").val(),
                postalCode: $("#postal_code").val(),
                qtyBlack: $('#lrw-id-checkout__qty--black').val(),
                qtyGrey: $('#lrw-id-checkout__qty--grey').val(),
                qtySilver: $('#lrw-id-checkout__qty--silver').val(),
                qtyOrange: $('#lrw-id-checkout__qty--orange').val(),
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
                    $("#invalidShipping").text("Sorry, we couldn't find any shipping solutions based on the information provided.").show()
                } else {
                    $("#invalidShipping").hide();
                    $('#shippingOptionsContainer').html("");

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

    $('#shippingOptionsContainer').on('change', 'input[name=shippingOptions]:radio', async function () {

        if ($("input[name=shippingOptions]:checked").val()) {
            shippingCharge = $("input[name=shippingOptions]:checked").val() || 0;
        } else {
            shippingCharge = 0;
        }

        updateCheckout();

    });

});