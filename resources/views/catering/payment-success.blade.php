<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Received! — AutoFuel</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 2rem;
        }
        .card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 1.5rem;
            padding: 3rem 2.5rem;
            max-width: 480px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }
        .icon-wrap {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            box-shadow: 0 0 30px rgba(16,185,129,0.4);
        }
        .icon-wrap svg { width: 40px; height: 40px; color: white; }
        h1 { color: #f1f5f9; font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem; }
        .subtitle { color: #94a3b8; font-size: 1rem; margin-bottom: 2rem; }
        .order-box {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 1rem;
            padding: 1.25rem 1.5rem;
            margin-bottom: 2rem;
            text-align: left;
        }
        .order-row { display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; border-bottom: 1px solid #1e293b; }
        .order-row:last-child { border-bottom: none; }
        .order-label { color: #64748b; font-size: 0.85rem; }
        .order-value { color: #e2e8f0; font-size: 0.9rem; font-weight: 600; }
        .steps { text-align: left; margin-bottom: 2rem; }
        .steps h3 { color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; }
        .step { display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 0.6rem; }
        .step-num { width: 22px; height: 22px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
        .step-text { color: #cbd5e1; font-size: 0.875rem; line-height: 1.5; }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 0.875rem 2rem;
            border-radius: 0.75rem;
            text-decoration: none;
            font-weight: 700;
            font-size: 0.95rem;
            transition: opacity 0.2s;
        }
        .btn:hover { opacity: 0.9; }
        .footer-note { color: #475569; font-size: 0.8rem; margin-top: 1.5rem; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        </div>

        <h1>Payment Received!</h1>
        <p class="subtitle">Your catering order is confirmed. We will contact you soon.</p>

        @if($order)
        <div class="order-box">
            <div class="order-row">
                <span class="order-label">Order</span>
                <span class="order-value">#{{ $order->id }}</span>
            </div>
            @if($order->catering)
            <div class="order-row">
                <span class="order-label">Paquete</span>
                <span class="order-value">{{ $order->catering->name }}</span>
            </div>
            @endif
            <div class="order-row">
                <span class="order-label">Customer</span>
                <span class="order-value">{{ $order->client_name }}</span>
            </div>
            <div class="order-row">
                <span class="order-label">Delivery Date</span>
                <span class="order-value">{{ \Carbon\Carbon::parse($order->delivery_date)->format('d/m/Y') }}</span>
            </div>
            <div class="order-row">
                <span class="order-label">Amount Paid</span>
                <span class="order-value" style="color:#10b981">${{ number_format($order->total_price, 2) }} USD</span>
            </div>
        </div>
        @endif

        <div class="steps">
            <h3>What happens next?</h3>
            <div class="step">
                <div class="step-num">1</div>
                <div class="step-text">You will receive a confirmation email with the order details.</div>
            </div>
            <div class="step">
                <div class="step-num">2</div>
                <div class="step-text">Our team will review your order and contact you to coordinate the details.</div>
            </div>
            <div class="step">
                <div class="step-num">3</div>
                <div class="step-text">On the day of the event, we will deliver your catering on time with AutoFuel quality.</div>
            </div>
        </div>

        <a href="https://autofuel.com" class="btn">Volver a AutoFuel →</a>

        <p class="footer-note">
            Have questions? Email us at <strong>info@autofuel.com</strong>
        </p>
    </div>
</body>
</html>
