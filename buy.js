$(document).ready(async function () {
    showLoader();
    const baseUrl = 'https://workflow.spericorn.com/';
    // const baseUrl = 'http://localhost:3000/';
    const apiUrl = 'https://restcountries.eu/rest/v2/all';

    $('#lrw-id-checkout__qty--black,#lrw-id-checkout__qty--grey,#lrw-id-checkout__qty--silver,#lrw-id-checkout__qty--orange').attr('disabled', 'disabled');

    $('#loaderContainer,#errorContainer,#failed,#success,#failed-form,#success-form').hide();
    $('#payment-form').attr('method', null);

    $('#failed-form,#success-form').remove();

    $('#lrw-id-checkout__order-summary--discount--applied').append(`<span class="span" id="remove-btn"><div class="remove-btn"></div>Remove</span>`).hide();
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

    var disCountPercentage = 0;
    var gstPercentage = 0;
    var shippingCharge = 0;

    var qtyBlack;
    var qtyGrey;
    var qtySilver;
    var qtyOrange;

    var step;

    const colourSelectBlack = $('#lrw-id-checkout__colour-select--black');
    const colourSelectGrey = $('#lrw-id-checkout__colour-select--grey');
    const colourSelectSilver = $('#lrw-id-checkout__colour-select--silver');
    const colourSelectOrange = $('#lrw-id-checkout__colour-select--orange');
    const orderSummaryRowBlack = $('#lrw-id-checkout__order-summary--black');
    const orderSummaryRowGrey = $('#lrw-id-checkout__order-summary--grey');
    const orderSummaryRowSilver = $('#lrw-id-checkout__order-summary--silver');
    const orderSummaryRowOrange = $('#lrw-id-checkout__order-summary--orange');
    
    updateCheckout();

    $('#lrw-id-checkout__colour-select--black').click(function () {
        if (qtyBlack === 0) { setQty('black', 1); }
    });

    $('#lrw-id-checkout__colour-select--grey').click(function () {
        if (qtyGrey === 0) { setQty('grey', 1); }
    });

    $('#lrw-id-checkout__colour-select--silver').click(function () {
        if (qtySilver === 0) { setQty('silver', 1); }
    });

    $('#lrw-id-checkout__colour-select--orange').click(function () {
        if (qtyOrange === 0) { setQty('orange', 1); }
    });

    $('#increment-black').click(function (e) {
        console.log('increment black');
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

    async function setQty(variant, qty) {
        //console.log('setQty', variant, qty);
        Cookies.set('_lrc-qty-' + variant, qty);
        shippingCharge = 0;
        $("#shippingList option:selected").prop("selected", false);
        await updateCheckout();
        //await getShipments();
    }

    function getQty(variant) {
        var qty = Cookies.get('_lrc-qty-' + variant);
        if (qty === undefined) {
            //console.log('getQty undefined', variant);
            return 0;
        }
        //console.log('getQty', qty);
        return parseInt(qty, 10);
    }

    function incrementQty(variant) {
        //console.log('INCREMENTQTY');
        var qty = getQty(variant);
        qty++;
        setQty(variant, qty);
    }

    function decrementQty(variant) {
        //console.log('DECREMENTQTY');
        var qty = getQty(variant);
        if (qty > 0) {
            qty--;
        } else {
            qty = 0;
        }
        setQty(variant, qty);
    }

    async function setStep(step) {
        //console.log('setQty', variant, qty);
        Cookies.set('_lrc-step', step);
        await updateCheckout();
    }

    function getStep() {
        var step = Cookies.get('_lrc-step');
        if (step === undefined) {
            return 1;
        }
        return parseInt(step, 10);
    }

    $('#step1-continue').click(function(e) {
        console.log('step1-continue');
        setStep(2);
    });

    $('#step2-continue').click(function(e) {
        console.log('step2-continue');
        setStep(3);
    });

    $('#step3-continue').click(function(e) {
        console.log('step3-continue');
        setStep(4);
    });

    $('#step4-continue').click(function(e) {
        console.log('step4-continue');
        setStep(5);
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
        shippingCharge = $("#shippingList option:selected").val() || 0;

        qtyBlack = getQty('black');
        qtyGrey = getQty('grey');
        qtySilver = getQty('silver');
        qtyOrange = getQty('orange');
        qtyTotal = qtyBlack + qtyGrey + qtySilver + qtyOrange;

        step = getStep();
        steps = [1,2,3,4,5];
        console.log('updateCheckout step', step);

        productPrice = parseFloat(((qtyBlack * priceBlack) + (qtyGrey * priceGrey) + (qtySilver * priceSliver) + (qtyOrange * priceOrange)).toFixed(2))
        discountPrice = parseFloat((productPrice * (disCountPercentage / 100)).toFixed(2));
        subscriptionPrice = parseFloat((qtyTotal * 12 * planPrice).toFixed(2));
        gstPrice = parseFloat(((productPrice - discountPrice + subscriptionPrice) * (gstPercentage / 100)).toFixed(2));

        $('#lrw-id-checkout__order-summary--gst-price').text(`$${addZeroes(gstPrice)}`);
        $('#lrw-id-checkout__order-summary--gst-label').text(`GST (${gstPercentage}%)`);
        $("#lrw-id-checkout__order-summary--discount--applied-price").text(`-$${addZeroes(discountPrice)}`);

        //console.log('updateCheckout', qtyBlack, qtyGrey, qtySilver, qtyOrange, qtyTotal);
        $('#lrw-id-checkout__qty--black').val(qtyBlack);
        $('#lrw-id-checkout__qty--grey').val(qtyGrey);
        $('#lrw-id-checkout__qty--silver').val(qtySilver);
        $('#lrw-id-checkout__qty--orange').val(qtyOrange);

        steps.map(s => {

            if (s < step) {
                $(`#step${s} .lrw-c-checkout__section__entry`).hide();
                $(`#step${s} .lrw-c-checkout__section__complete`).show();
            } else if (s === step) {
                $(`#step${s} .lrw-c-checkout__section__entry`).show();
                $(`#step${s} .lrw-c-checkout__section__complete`).hide();
            } else if (s > step) {
                $(`#step${s} .lrw-c-checkout__section__entry`).hide();
                $(`#step${s} .lrw-c-checkout__section__complete`).hide();
            }

        })


        if (qtyBlack > 0) {
            colourSelectBlack.addClass('lrw-c-checkout__colour-select--selected');
            orderSummaryRowBlack.removeClass('lrw-c-checkout__order-summary--hidden');
            $('#lrw-id-summary__total-device--black').text(`$${addZeroes(parseFloat((qtyBlack * priceBlack).toFixed(2)))}`);
        } else {
            colourSelectBlack.removeClass('lrw-c-checkout__colour-select--selected');
            orderSummaryRowBlack.addClass('lrw-c-checkout__order-summary--hidden');
        }
        if (qtyGrey > 0) {
            colourSelectGrey.addClass('lrw-c-checkout__colour-select--selected');
            orderSummaryRowGrey.removeClass('lrw-c-checkout__order-summary--hidden');
            $('#lrw-id-summary__total-device--grey').text(`$${addZeroes(parseFloat((qtyGrey * priceGrey).toFixed(2)))}`);
        } else {
            colourSelectGrey.removeClass('lrw-c-checkout__colour-select--selected');
            orderSummaryRowGrey.addClass('lrw-c-checkout__order-summary--hidden');
        }
        if (qtySilver > 0) {
            colourSelectSilver.addClass('lrw-c-checkout__colour-select--selected');
            orderSummaryRowSilver.removeClass('lrw-c-checkout__order-summary--hidden');
            $('#lrw-id-summary__total-device--silver').text(`$${addZeroes(parseFloat((qtySilver * priceSliver).toFixed(2)))}`);
        } else {
            colourSelectSilver.removeClass('lrw-c-checkout__colour-select--selected');
            orderSummaryRowSilver.addClass('lrw-c-checkout__order-summary--hidden');
        }
        if (qtyOrange > 0) {
            colourSelectOrange.addClass('lrw-c-checkout__colour-select--selected');
            orderSummaryRowOrange.removeClass('lrw-c-checkout__order-summary--hidden');
            $('#lrw-id-summary__total-device--orange').text(`$${addZeroes(parseFloat((qtyOrange * priceOrange).toFixed(2)))}`);
        } else {
            colourSelectOrange.removeClass('lrw-c-checkout__colour-select--selected');
            orderSummaryRowOrange.addClass('lrw-c-checkout__order-summary--hidden');
        }
        if (qtyTotal > 0) {
            let totalPrice = (parseFloat(((productPrice - discountPrice) + gstPrice + subscriptionPrice).toFixed(2)) + parseFloat(shippingCharge)).toFixed(2);
            $('#lrw-id-checkout__order-summary--gst').show();
            $('#lrw-id-summary__total-plan').text(`$${qtyTotal * 12 * planPrice}`);
            $('#lrw-id-checkout__qty--total').text(`${qtyTotal}`);
            $('#lrw-id-summary__total').text(`USD $${addZeroes(totalPrice)}`);
            $('#lrw-id-btn__checkout').removeClass('lrw-c-button--disabled').attr("disabled", false);
            $('#lrw-id-checkout__order-summary--subscription').show();
            $("#checkout-pay-btn").val(`Pay USD$${addZeroes(totalPrice)}`).attr("disabled", false);
            $('#lrw-id-checkout__order-summary--shipping-price').text(`${shippingCharge ? '$' + shippingCharge : 'Not Selected'}`);
            $("#lrw-id-checkout__order-summary--shipping").show()
        } else {
            $('#lrw-id-checkout__order-summary--gst').hide();
            $('#lrw-id-checkout__order-summary--subscription').hide();
            $('#lrw-id-summary__total-plan').text('-');
            $('#lrw-id-checkout__qty--total').text('-');
            $('#lrw-id-summary__total').text('-');
            $('#lrw-id-btn__checkout').addClass('lrw-c-button--disabled').attr("disabled", true);
            $("#checkout-pay-btn").val(`Pay`).attr("disabled", true);
            $("#lrw-id-checkout__order-summary--discount--applied").hide();
            $("#lrw-id-checkout__order-summary--shipping").hide();
            $('#shippingList').find('option').not(':first').remove();
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
            $(`#${p.colour}Name`).text(p.name);
            $(`#${p.colour}Price`).text(`$${p.price} + $${planPrice}/month`)
            $(`#review-${p.colour}Name`).text(p.name);
        })
    }

    $('#lrw-id-checkout__qty--discount-button').click(async () => {
        showLoader();
        const coupon = $('#lrw-id-checkout__qty--discount').val();
        const {data} = await axios.get(`${baseUrl}applyCoupon?name=${coupon.toLowerCase()}`);

        if (!data.success) {
            $("#invalid-coupon").show();
            $("#lrw-id-checkout__order-summary--discount--applied").hide();
            disCountPercentage = 0;
        } else {
            $("#invalid-coupon").hide();
            disCountPercentage = data.data.coupon[0].percent_off;
            $("#lrw-id-checkout__order-summary--discount--applied").show();
        }
        updateCheckout()
        hideLoader()
    });

    const {data: countryList} = await axios.get(apiUrl);
    countryList.map(c => $('#countryList').append(`<option value="${c.alpha2Code}">${c.name}</option>`));

    $('#countryList').change(async function () {
        await getShipments();
        updateCheckout();
    });

    $('#remove-btn').click(function () {
        disCountPercentage = 0;
        $("#lrw-id-checkout__order-summary--discount--applied").hide();
        $('#lrw-id-checkout__qty--discount').val('');
        updateCheckout()
    });

    $("#lrw-id-checkout__qty--discount").focus(function () {
        $('#invalid-coupon').hide()
    });

    async function submitOrder(token) {
        var $inputs = $('#payment-form :input');
        var values = {};
        $inputs.each(function () {
            values[this.name] = $(this).val();
        });

        //values.courier_id = $("#shippingList option:selected").attr('courier_id');
        values.courier_id = $("input[name='shippingOptions']:checked").attr('courier_id');

        console.log('submitOrder', values);

        try {
            const data = await axios.post(`${baseUrl}submitOrder`, {...values, token});

            if (data.data.success) {
                $("#payment-form").hide();
                $("#success").show();
            }
        } catch (e) {
            $("#payment-form").hide();
            $("#failed").show();
        }
    }

    var stripe = Stripe('pk_test_NfGmilMUc09ZDA2aCdwvq7OU');

    var elements = stripe.elements();

    var style = {
        base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
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
    });

    async function getShipments() {

        console.log('getShipments', qtyTotal);

        if (qtyTotal > 0) {
            $("#invalidShipping").hide();
            $('#shippingList').find('option').not(':first').remove();

            showLoader();
            const payload = {
                countryCode: $("#countryList option:selected").val(),
                postalCode: $("#postal_code").val(),
                qtyBlack: $('#lrw-id-checkout__qty--black').val(),
                qtyGrey: $('#lrw-id-checkout__qty--grey').val(),
                qtySilver: $('#lrw-id-checkout__qty--silver').val(),
                qtyOrange: $('#lrw-id-checkout__qty--orange').val(),
                qtyTotal
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

                    $("#shippingOptionContainer").html("");
                    data.data.rates.map(r => {
                        $('#shippingList').append(`<option courier_id="${r.courier_id}" value="${r.total_charge}">${r.courier_name}  $${r.total_charge}</option>`);

                        $("#shippingOptionsContainer").append(`<label class="lrw-c-checkout__radio-button-field w-radio">
                            <input type="radio" data-name="shippingOptions" courier_id="${r.courier_id}" id="radio" name="shippingOptions" value="${r.total_charge}" class="w-form-formradioinput lrw-c-checkout__radio-button w-radio-input"/>
                            <span class="lrw-c-checkout__radio-label w-form-label">${r.courier_name}  $${r.total_charge}</span>
                        </label>`);
                    });
                }
            }
            hideLoader();
        }
    }

    $('#shippingList').change(async function () {
        if ($("#shippingList option:selected").val()) {
            shippingCharge = $("#shippingList option:selected").val() || 0
        } else {
            shippingCharge = 0
        }
        updateCheckout();
    });

});