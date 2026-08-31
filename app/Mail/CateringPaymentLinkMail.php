<?php

namespace App\Mail;

use App\Models\CateringOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CateringPaymentLinkMail extends Mailable
{
    use Queueable, SerializesModels;

    public CateringOrder $order;
    public string $paymentUrl;
    public float $amount;

    /**
     * Create a new message instance.
     */
    public function __construct(CateringOrder $order, string $paymentUrl, float $amount)
    {
        $this->order      = $order;
        $this->paymentUrl = $paymentUrl;
        $this->amount     = $amount;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🍽️ Tu link de pago para Catering #' . $this->order->id . ' — AutoFuel',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.catering-payment-link',
            with: [
                'order'      => $this->order,
                'paymentUrl' => $this->paymentUrl,
                'amount'     => $this->amount,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
