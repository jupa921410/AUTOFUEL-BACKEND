@component('mail::message')
# 🍽️ Your Payment Link — AutoFuel Catering

Hola **{{ $order->client_name }}**,

We have prepared your catering order and it is ready to be confirmed. Your request details are below:

---

@component('mail::panel')
**📋 Order Details #{{ $order->id }}**

| Campo              | Detalle                                                                  |
|--------------------|--------------------------------------------------------------------------|
| **Paquete**        | {{ $order->catering?->name ?? 'Paquete Personalizado' }}                 |
| **Delivery Date** | {{ \Carbon\Carbon::parse($order->delivery_date)->format('d/m/Y H:i') }} |
| **Cantidad a Pagar** | **${{ number_format($amount, 2) }} USD**                               |
| **Email**         | {{ $order->client_email }}                                               |
@if($order->notes)
| **Notas**          | {{ $order->notes }}                                                      |
@endif
@endcomponent

---

To complete your reservation, click the button below and follow the payment instructions:

@component('mail::button', ['url' => $paymentUrl, 'color' => 'success'])
💳 Pay Now — ${{ number_format($amount, 2) }} USD
@endcomponent

> ⚠️ **This payment link is valid for 24 hours.** Once payment is complete, you will receive an email confirmation.

---

### How to pay

1. **Click** the "Pay Now" button above.
2. **Enter the details** for your credit or debit card (we accept Visa, Mastercard, and Amex).
3. **Confirm payment** — you will receive a receipt immediately.
4. Our team will **confirm your order** and contact you before the delivery date.

---

If you have questions or need to change your order, contact us at:

📧 **hello@autofuel.com**  
📞 **+1 (305) 000-0000**

Thank you for choosing **AutoFuel** for your event!

@component('mail::subcopy')
If you did not request this catering service, you can ignore this email. If the button does not work, copy and paste this link into your browser: {{ $paymentUrl }}
@endcomponent

@endcomponent
