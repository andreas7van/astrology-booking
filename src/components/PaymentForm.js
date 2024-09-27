import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirecting
import { useTranslation } from 'react-i18next'; // Import useTranslation for language switching
import '../themes/PaymentForm.css'; // Assuming you have custom styles here

function PaymentForm({ onPaymentSuccess, appointmentDetails }) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            console.error(t('stripe_error'));
            return;
        }

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            console.error(t('card_error'));
            return;
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            console.error(t('payment_method_error'), error);
            return;
        }

        // Στέλνουμε το appointmentDetails μαζί με την πληρωμή
        const response = await fetch('http://localhost:3001/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentMethodId: paymentMethod.id,
                amount: 5000, // Το ποσό σε cents
                appointmentDetails, // Περνάμε τα στοιχεία του ραντεβού
            }),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error(t('server_error'), errorMessage);
            return;
        }

        const paymentIntent = await response.json();

        if (paymentIntent.error) {
            console.error(t('payment_intent_error'), paymentIntent.error);
        } else if (paymentIntent.paymentIntent.status === 'succeeded') {
            onPaymentSuccess(paymentMethod);
            navigate('/confirmation');
        } else {
            console.error(t('unexpected_payment_status'), paymentIntent.paymentIntent.status);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <h2>{t('payment_title')}</h2>
            <p>{t('product_cost')} <strong>50€</strong></p>
            <CardElement />
            <button type="submit" disabled={!stripe}>{t('complete_payment_button')}</button>
        </form>
    );
}



export default PaymentForm;

