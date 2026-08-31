<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pago Cancelado — AutoFuel</title>
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
            background: linear-gradient(135deg, #f59e0b, #d97706);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            box-shadow: 0 0 30px rgba(245,158,11,0.3);
        }
        .icon-wrap svg { width: 40px; height: 40px; color: white; }
        h1 { color: #f1f5f9; font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem; }
        .subtitle { color: #94a3b8; font-size: 1rem; margin-bottom: 2rem; }
        .info-box {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 1rem;
            padding: 1.25rem 1.5rem;
            margin-bottom: 2rem;
            color: #94a3b8;
            font-size: 0.9rem;
            line-height: 1.6;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b, #d97706);
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
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
        </div>

        <h1>Pago Cancelado</h1>
        <p class="subtitle">No charge was made. Your order is still awaiting payment.</p>

        <div class="info-box">
            Your catering reservation <strong style="color:#e2e8f0">
                @if($order) #{{ $order->id }} @endif
            </strong> remains in our system.
            To proceed with payment, contact us and we will send you a new payment link.
        </div>

        <a href="https://autofuel.com" class="btn">Volver a AutoFuel →</a>

        <p class="footer-note">
            Need help? Contact us at <strong>info@autofuel.com</strong>
        </p>
    </div>
</body>
</html>
