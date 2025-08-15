from flask import Flask, render_template, abort, request, redirect, url_for, flash, session, jsonify, send_file, send_from_directory
# from flask_wtf import CSRFProtect
from flask_login import login_user, LoginManager, current_user, logout_user, login_required
import uuid
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime, timezone
from urllib.parse import urlencode
import uuid
from sqlalchemy.dialects.postgresql import UUID
import time
from werkzeug.utils import secure_filename
import os
import re
from models import db, User, Product, Image, Wishlist, Transaction
from flask_mail import Mail, Message
from sqlalchemy import func
import shutil
import pyotp
from datetime import datetime, timedelta, timezone
from mail_file import send_contact_email, send_transaction_mail, CONTRACT_LINK
from contract import get_balance_and_autowithdrawStatus



app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cars.db'
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")   
app.config['MAIL_PASSWORD'] =  os.getenv("MAIL_PASSWORD")        
app.config['MAIL_DEFAULT_SENDER'] = ("Pyman Ethereum Marketplace", app.config['MAIL_USERNAME'])
mail = Mail(app)


db.init_app(app)

manager = LoginManager(app)


with app.app_context():
    db.create_all()


BRANDS = ["Acura", "Aston-Martin", "Audi", "Bentley", "BMW", "BYD", "Cadillac", "Chevrolet", "Citroen",
          "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Kia", "Land-Rover", "Lexus", "Maybach", "McLaren",
          "Mercedes-AMG", "Mercedes-Benz", "Mitsubishi", "Nissan", "Peugeot", "Renault", "Rolls-Royce", "Tesla",
          "Toyota", "Volkswagen"
        ]

@manager.user_loader
def load_user(idn):
    return db.get_or_404(User, idn)


@app.route('/')
def home():
    return "Hello"
    

@app.get("/api/get-products")
def get_products():
    products = Product.query.order_by(Product.created_at.asc()).all()
    return jsonify([product.to_dict() for product in products])


@app.route('/api/seller-products/<address>', methods=['GET'])
def get_seller_products(address):
    user = User.query.filter(func.lower(User.address) == address.lower()).first()
    if not user:
        abort(404)

    products = Product.query.filter_by(seller_id=user.id).all()

    return jsonify({"seller_name": user.name, "products": [product.to_dict() for product in products]})


@app.route('/api/get-product/<slug>', methods=['GET'])
def get_product(slug):
    product = Product.query.filter_by(slug=slug).first_or_404()
    return jsonify(product.to_dict())


@app.route('/api/add-product', methods=['POST'])
def add_product():
    data = request.form
    images = request.files.getlist('images')

    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', data.get('title')) 
    slug = slug.lower().replace(" ", "-") 
    slug = slug + "-" + str(uuid.uuid4())

    address = data.get("address").lower()

    user = User.query.filter_by(address=address).first_or_404()
    if not user.is_seller:
        abort(403)

    if data.get("brand") not in BRANDS:
        return jsonify({'message': 'Unrecognised brand.'}), 400

    product = Product(
        title=data.get('title'),
        brand=data.get('brand'),
        model=data.get('model'),
        slug=slug,
        fuel_type=data.get('fuel_type'),
        transmission=data.get('transmission'),
        vehicle_type=data.get('vehicle_type'),
        year=int(data.get('year')) if data.get('year') else None,
        description=data.get('description'),
        price=float(data.get('price')),
        mileage=int(data.get('mileage')) if data.get('mileage') else 0,
        seller_id=user.id
    )

    db.session.add(product)
    db.session.flush()  # get product.id before commit

    # Save images
    for image in images:
        filename = f"{str(uuid.uuid4())}_{secure_filename(image.filename)}"
        image_folder = os.path.join(os.path.join(os.getcwd(), 'images', address, product.id))
        os.makedirs(image_folder, exist_ok=True)

        image_path = os.path.join(image_folder, filename)
        image.save(image_path)

        base_url = request.host_url.rstrip('/')
        image_url = f"{base_url}/images/{address}/{product.id}/{filename}"

        img = Image(path=image_url, product_id=product.id)
        db.session.add(img)

    db.session.commit()
    return jsonify({'message': 'Product added successfully'}), 201


@app.route('/images/<address>/<product_id>/<filename>')
def serve_image(address, product_id, filename):
    return send_from_directory(f'images/{address}/{product_id}', filename)



@app.route('/api/edit-product/<slug>', methods=['PUT'])
def edit_product(slug):
    product = Product.query.filter_by(slug=slug).first()
    if not product:
        return jsonify({'error': 'Product not found'}), 404
        
    data = request.form
    new_images = request.files.getlist('new_images')
    existing_images = request.form.getlist('existing_images')

    address = data.get("address").lower()
    user = User.query.filter_by(address=address).first_or_404()
    if not user.is_seller:
        abort(403)

    if product.seller != user:
        abort(403)
        
    product.title = data.get('title')
    product.brand = data.get('brand')
    product.model = data.get('model')
    product.year = int(data.get('year')) if data.get('year') else None
    product.price = float(data.get('price')) if data.get('price') else 0
    product.mileage = int(data.get('mileage')) if data.get('mileage') else 0
    product.fuel_type = data.get('fuel_type')
    product.transmission = data.get('transmission')
    product.vehicle_type = data.get('vehicle_type')
    product.description = data.get('description')

    # Get images that are being removed
    images_to_delete = Image.query.filter(
        Image.product_id == product.id,
        ~Image.path.in_(existing_images)
    ).all()

    for img in images_to_delete:
        try:
            # Extract actual path on disk
            filename = img.path.rsplit('/', 1)[-1]
            file_path = os.path.join(os.getcwd(), 'images', product.id, filename)
            if os.path.exists(file_path):
                os.remove(file_path)         
        except Exception as e:
            print(f"Failed to delete image file: {e}")

    # Then delete the DB records
    Image.query.filter(
        Image.product_id == product.id,
        ~Image.path.in_(existing_images)
    ).delete(synchronize_session=False)

    for img_file in new_images:
        filename = f"{secure_filename(img_file.filename)}_{uuid.uuid4()}"
        path = os.path.join(os.getcwd(), 'images', product.id, filename)
        img_file.save(path)
        img_url = request.host_url.rstrip('/') + '/images/' + product.id + "/" + filename
        db.session.add(Image(path=img_url, product_id=product.id))

    db.session.commit()
    return jsonify({'message': 'Product updated successfully'})


@app.route("/api/get-brands")
def get_brands():
    return jsonify({"brands": BRANDS})


@app.route('/api/delete-product/<slug>', methods=['DELETE'])
def delete_product(slug):
    product = Product.query.filter_by(slug=slug).first()
    if not product:
        return jsonify({'error': 'Product not found.'}), 404

    if product.has_transaction: 
        return jsonify({'error': 'Product has transaction.'}), 400
    # Delete all associated images from DB
    Image.query.filter_by(product_id=product.id).delete()

    # Remove the entire image folder for this product
    image_dir = os.path.join(os.getcwd(), 'images', product.seller.address, product.id)
    if os.path.exists(image_dir):
        try:
            shutil.rmtree(image_dir)
        except Exception as e:
            return jsonify({'message': f"Error deleting image directory: {e}"})


    # Delete the product record
    db.session.delete(product)
    db.session.commit()

    return jsonify({'message': 'Product deleted successfully.'})


@app.get('/api/logged_status')
def logged_status():
    return jsonify({"logged_in": current_user.is_authenticated})


@app.route('/api/user-exists/<address>', methods=['GET'])
def user_exists(address):
    user = User.query.filter(func.lower(User.address) == address.lower()).first()
    if not user:
        abort(404)
    info = {
        "email": user.email,
        "name": user.name,
        "address": user.address,
        "is_seller": user.is_seller
    }
    return jsonify(info)



@app.route('/api/register-user', methods=['POST'])
def register_user():
    data = request.get_json()

    name = data.get('name')
    email = data.get('email').lower()
    address = data.get('address')

    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({"status": False, "message": "Email has been taken."})
    
    try:
        secret = pyotp.random_base32()
        totp = pyotp.TOTP(secret, interval=300)  # 5 mins
        otp = totp.now()
        session["otp_info"] = {
            "secret": secret,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "name": name,
            "email": email,
            "address": address
        }

        msg = Message("Pyman Ethereum Marketplace OTP", recipients=[email])
        msg.html = f"<h1>Your OTP: {otp}</h1><p>Use it to log in. It expires in 5 minutes.</p>"
        mail.send(msg)
    except Exception as e:
        return jsonify({"status": False, "message": str(e)})
    else:
        return jsonify({"status": True, 'message': 'OTP has been sent to your email.'}), 200
    


@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email')
    otp_input = data.get('otp')

    otp_info = session.get('otp_info')

    if not all([otp_info]):
        return jsonify({'status': False, 'message': 'OTP session not found'}), 400

    created_at = otp_info['created_at']
    secret = otp_info['secret']
    email = otp_info['email']
    name = otp_info['name']
    address = otp_info['address']

    # Check if OTP is expired
    created_time = datetime.fromisoformat(created_at)
    if datetime.now(timezone.utc) > created_time + timedelta(minutes=5):
        session.clear()
        return jsonify({'status': False, 'message': 'OTP has expired'}), 400

    # Verify OTP
    totp = pyotp.TOTP(secret, interval=300)
    if totp.verify(otp_input):
        msg = Message(subject="Signed Up!", recipients=[email])
        msg.body = f"""Thanks for signing up to Pyman, a multivendor car marketplace built on the ethereum blockchain. See the contract at {CONTRACT_LINK}
            If you are a wanna-be vendor, you can update your account to vendor account at https://multivendor-ethereum-marketplace.vercel.app/account
        """
        mail.send(msg)
        session.clear()
        new_user = User(
            name=name.capitalize(),
            email=email,
            address=address.lower(),
        )
        db.session.add(new_user)
        db.session.commit()

        folder = os.path.join(os.getcwd(), 'images', new_user.address)
        os.makedirs(folder, exist_ok=True)

        return jsonify({'status': True, 'message': 'OTP verified successfully'}), 200
    else:
        return jsonify({'status': False, 'message': 'Invalid OTP'}), 400


@app.route('/api/update-name', methods=['POST'])
def update_name():
    data = request.get_json()
    address = data.get("address")
    name = data.get("name")
    user = User.query.filter(func.lower(User.address) == address.lower()).first()
    if not user:
        abort(404)
    
    user.name = name
    db.session.commit()
    
    return {"status": True, "message": "Name has been successfully updated."}


@app.route('/api/make-vendor', methods=['POST'])
def make_vendor():
    data = request.get_json()
    address = data.get("address")
    user = User.query.filter(func.lower(User.address) == address.lower()).first()
    if not user:
        abort(404)

    folder = os.path.join(os.getcwd(), 'images', user.address)
    os.makedirs(folder, exist_ok=True)

    user.is_seller = True
    db.session.commit()
    
    return {"status": True, "message": "Upgrade to seller account successful!"}


@app.get('/api/wishlists')
def get_wishlists():
    address = request.args.get("wallet")
    if not address:
        abort(403)
    user = User.query.filter_by(address=address).first_or_404()
    wishlists = Wishlist.query.filter_by(user_id=user.id).all()
    product_ids = [w.product_id for w in wishlists]
    return jsonify({"wishlists": product_ids}), 200


@app.post('/api/add-wishlist')
def add_wishlist():
    address = request.args.get("wallet")
    if not address:
        abort(403)
    user = User.query.filter_by(address=address).first_or_404()

    data = request.get_json()
    product_id = data.get('product_id')

    # Prevent duplicate wishlist entries
    exists = Wishlist.query.filter_by(user_id=user.id, product_id=product_id).first()
    if exists:
        return jsonify({"message": "Already wishlisted"}), 200

    wishlist_item = Wishlist(user_id=user.id, product_id=product_id)
    db.session.add(wishlist_item)
    db.session.commit()
    return jsonify({"message": "Added"}), 201


@app.post('/api/remove-wishlist')
def remove_wishlist():
    address = request.args.get("wallet")
    if not address:
        abort(403)
    user = User.query.filter_by(address=address).first_or_404()

    data = request.get_json()
    product_id = data.get('product_id')

    Wishlist.query.filter_by(user_id=user.id, product_id=product_id).delete()
    db.session.commit()
    return '', 204


@app.post('/api/create-transaction')
def create_transaction():
    data = request.get_json()
    transaction_id = data.get('transaction_id')
    seller_addr = data.get('seller').lower()
    buyer_addr = data.get('buyer').lower()
    amount = data.get('amount')
    product_id = data.get('product_id')

    product = Product.query.filter_by(id=product_id).first_or_404()

    new_transaction = Transaction(
        transaction_id=transaction_id,
        seller=seller_addr,
        buyer=buyer_addr,
        amount=amount,
        product_id=product_id
    )
    
    db.session.add(new_transaction)
    if not product.has_transaction:
        product.has_transaction = True
    
    buyer = User.query.filter_by(address=buyer_addr).first()
    seller = User.query.filter_by(address=seller_addr).first()

    title = f"Transaction {transaction_id} has been initialized!"
    content_seller = f"""
    Dear {seller.name.split(" ")[0]},<br>
    A potential buyer has created a transaction and paid (Transaction {transaction_id}) for the product details below.
    <br><br>Kindly deliver the product to them.
    """

    content_buyer = f"""
    Dear {buyer.name.split(" ")[0]},<br>
    Thanks for your order!<br><br> The seller will proceed to deliver the product to you.
    """    

    msg_buyer = send_transaction_mail(title=title, content=content_buyer, recipients=[buyer.email], product=product)
    msg_seller = send_transaction_mail(title=title, content=content_seller, recipients=[seller.email], product=product)
    try:
        mail.send(msg_buyer)
        mail.send(msg_seller)
    except Exception as e:
        return jsonify({"Message": str(e)}), 500
    else:
        db.session.commit()

    return jsonify({"message": "Added Transaction."}), 201


@app.post('/api/update-transaction')
def update_transaction():
    data = request.get_json()
    transaction_id = data.get("transaction_id")
    status = data.get("new_status")

    transaction = Transaction.query.filter_by(transaction_id=transaction_id).first_or_404()

    transaction.status = status

    product = transaction.product

    buyer = User.query.filter_by(address=transaction.buyer).first()
    seller = User.query.filter_by(address=transaction.seller).first()

    if status == 1:
        title = f"Seller has delivered product in transaction {transaction_id}"
        content_seller = f"""
        Dear {seller.name.split(" ")[0]},<br><br>
        You have marked the transaction with ID: {transaction_id} as delivered.<br>
        We are now waiting for the buyer to confirm the delivery, and then you'll be able to claim your funds.
        """

        content_buyer = f"""
        Dear {buyer.name.split(" ")[0]},<br><br>
        The seller in the transaction with ID: {transaction_id} has marked it as delivered.<br>
        Please confirm the delivery when you receive it. If you are not satisfied with the product, you can raise a dispute later.
        """
    elif status == 2:
        title = f"Buyer has confirmed receiving product in transaction {transaction_id}"
        content_buyer = f"""
        Dear {buyer.name.split(" ")[0]},<br><br>
        You have marked the transaction with ID: {transaction_id} as confirmed, meaning you have received the product.<br>
        You can raise a dispute within the next 24 hrs if you happen to be dissatisfied with the product.
        """

        content_seller = f"""
        Dear {seller.name.split(" ")[0]},<br><br>
        The buyer in the transaction with ID: {transaction_id} has confirmed that they have received the product.<br>
        Barring them raising a dispute on the transaction, you will be able to claim your funds in the next 24 hrs.
        """
    elif status == 3:
        title = f"Buyer has raied a dispute on transaction {transaction_id}"
        content_buyer = f"""
        Dear {buyer.name.split(" ")[0]},<br><br>
        You have just disputed the transaction with ID: {transaction_id}.<br>
        You should proceed to returning the product back to the seller. When they confirm the return, we will immediately refund your funds.
        """

        content_seller = f"""
        Dear {seller.name.split(" ")[0]},<br><br>
        The buyer in the transaction with ID: {transaction_id} has raised a dispute and will return your product to you.<br>
        When they do that, you should let us know immediately so we can refund their funds to them.
        """
    elif status == 4:
        title = f"Transaction {transaction_id} cancelled!"
        content_seller = f"""
        Dear {seller.name.split(" ")[0]},<br><br>
        You have confirmed the return of the product in transaction with ID: {transaction_id} and the transaction has been cancelled and finalized.
        """

        content_buyer = f"""
        Dear {buyer.name.split(" ")[0]},<br><br>
        The seller in the transaction with ID: {transaction_id} has confirmed the return of their product.<br>
        Your funds have been refunded and the transaction has been cancelled and finalized. Thank you.
        """
    elif status == 5:
        title = f"Transaction {transaction_id} successful and finalized."
        content_seller = f"""
        Dear {seller.name.split(" ")[0]},<br><br>
        You have successfully claimed your funds in transaction with ID: {transaction_id} and the transaction has been successfully finalized.<br><br>
        Thank you!
        """

        content_buyer = f"""
        Dear {buyer.name.split(" ")[0]},\n
        The seller in the transaction with ID: {transaction_id} and the transaction has been successfully finalized.<br><br>
        Thank you!
        """

    msg_buyer = send_transaction_mail(title=title, content=content_buyer, recipients=[buyer.email], product=product)
    msg_seller = send_transaction_mail(title=title, content=content_seller, recipients=[seller.email], product=product)

    try:
        mail.send(msg_buyer)
        mail.send(msg_seller)
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    else:
        db.session.commit()

    print({"message": "Transaction updated successfully.", "new_status": transaction.status})
    return jsonify({"message": "Transaction updated successfully.", "new_status": transaction.status}), 201


@app.get('/api/get-transactions')
def get_transactions():
    address = request.args.get("wallet")
    if not address:
        abort(403)
    
    address = address.lower()

    buyer = Transaction.query.filter_by(buyer=address).all()
    seller = Transaction.query.filter_by(seller=address).all()
    # print({"buyer": [b.to_dict() for b in buyer], "seller": [s.to_dict() for s in seller]})
    return jsonify({"buyer": [b.to_dict() for b in buyer], "seller": [s.to_dict() for s in seller]}), 200


@app.post('/api/contact')
def contact():
    data = request.get_json()
    message = data.get("message")
    phone = data.get("phone")
    name = data.get("name")
    subject = data.get("subject")
    email = data.get("email")

    content = f"""
    Name: {name} <br>
    Email: {email} <br>
    {"Phone: " + phone + "<br>" if phone else ""}
    <br><br>
    {message}
    """
    
    if subject:
        pass
    else:
        subject = "Message from Contact Page"
    msg = send_contact_email(title=subject, recipients=[app.config['MAIL_USERNAME']], content=content)
    try:
        mail.send(msg)
    except Exception as e:
        return jsonify({"Message": str(e)}), 500
    else:
        return jsonify({"message": "Message sent successfully!"})


@app.post("/api/balance-and-autowithdraw")
def balance_and_autowithdrawStatus():
    data = request.get_json()
    address = data.get("address")

    if not address:
        return jsonify({"error": "Address required."}), 400

    success, response = get_balance_and_autowithdrawStatus(address=address)
    if not success:
        
        if "getaddrinfo failed" in response["error"]:
            return jsonify({"error": "Failed to connect."}), response["code"]
        else:
            return jsonify({"error": response["error"]}), response["code"]

    print("Successfull autowu")
    return jsonify(response), 200 
        


if __name__ == "__main__":
    app.run(port=3051, debug=True)