from datetime import datetime
from flask_mail import Message


CONTRACT_LINK = "https://sepolia.etherscan.io/address/0xca5c9a13495152AB6390d0A26715fF56db404B36"


def send_transaction_mail(title, recipients, content, product):
    msg = Message(title, recipients=recipients)
    msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            <style>
                body {{
                    margin: 0;
                    padding: 0;
                    background-color: #f9fafb;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #1f2937;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }}
                .brand {{
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 30px;
                    text-decoration: none;
                    color: #1d4ed8;
                    font-weight: 700;
                    font-size: 24px;
                }}
                .title {{
                    font-size: 20px;
                    font-weight: 600;
                    margin-bottom: 20px;
                }}
                .content {{
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }}
                .product {{
                    background-color: #f3f4f6;
                    padding: 20px;
                    border-radius: 8px;
                    font-size: 15px;
                    margin-bottom: 30px;
                }}
                .product b {{
                    display: inline-block;
                    width: 80px;
                }}
                .footer {{
                    text-align: center;
                    font-size: 13px;
                    color: #6b7280;
                }}
                a {{
                    color: #1d4ed8;
                    text-decoration: none;
                }}
                a:hover {{
                    text-decoration: underline;
                }}
                @media (prefers-color-scheme: dark) {{
                    body {{
                        background-color: #111827;
                        color: #f3f4f6;
                    }}
                    .container {{
                        background-color: #1f2937;
                    }}
                    .brand-icon {{
                        background-color: #fff;
                        color: #000;
                    }}
                    .product {{
                        background-color: #374151;
                    }}
                    .footer {{
                        color: #9ca3af;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="brand">
                    <a href="/" class="brand-link">
                        <div>Pyman</div>
                    </a>
                </div>

                <div class="title">{title}</div>

                <div class="content">
                    {content}
                </div>

                <div class="product">
                    <div><b>Title:</b> {product.title}</div>
                    <div><b>Price:</b> {product.price} ETH</div>
                    <div><b>Contract:</b> <a href="{CONTRACT_LINK}">View on Etherscan</a></div>
                </div>

                <div class="footer">
                    <p>Pyman &copy; {datetime.now().year}</p>
                </div>
            </div>
        </body>
        </html>
        """
    return msg


def send_contact_email(title, recipients, content):
    msg = Message(title, recipients=recipients)
    msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            <style>
               body {{
                    margin: 0;
                    padding: 0;
                    background-color: #f9fafb;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #1f2937;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }}
                .brand {{
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 30px;
                    text-decoration: none;
                    color: #1d4ed8;
                    font-weight: 700;
                    font-size: 24px;
                }}
                .title {{
                    font-size: 20px;
                    font-weight: 600;
                    margin-bottom: 20px;
                }}
                .content {{
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }}
                .product {{
                    background-color: #f3f4f6;
                    padding: 20px;
                    border-radius: 8px;
                    font-size: 15px;
                    margin-bottom: 30px;
                }}
                .product b {{
                    display: inline-block;
                    width: 80px;
                }}
                .footer {{
                    text-align: center;
                    font-size: 13px;
                    color: #6b7280;
                }}
                a {{
                    color: #1d4ed8;
                    text-decoration: none;
                }}
                a:hover {{
                    text-decoration: underline;
                }}
                @media (prefers-color-scheme: dark) {{
                    body {{
                        background-color: #111827;
                        color: #f3f4f6;
                    }}
                    .container {{
                        background-color: #1f2937;
                    }}
                    .brand-icon {{
                        background-color: #fff;
                        color: #000;
                    }}
                    .product {{
                        background-color: #374151;
                    }}
                    .footer {{
                        color: #9ca3af;
                    }}
                }}

            </style>
        </head>
        <body>
            <div class="container">
                <div class="brand">
                    <a href="/" class="brand-link">
                        <div>Pyman</div>
                    </a>
                </div>

                <div class="content">
                    {content}
                </div>

                <div class="footer">
                    <p>Pyman &copy; {datetime.now().year}</p>
                </div>
            </div>
        </body>
        </html>
        """
    return msg




