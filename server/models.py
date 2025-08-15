from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime, timezone
import uuid

db = SQLAlchemy()


class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(250), nullable=False, unique=True)
    name = db.Column(db.String(250), nullable=False)
    address = db.Column(db.String(250), nullable=False, unique=True)
    is_seller = db.Column(db.Boolean, default=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    products = db.relationship(
        'Product',
        back_populates='seller',
        cascade='all, delete',
        passive_deletes=True
    )


    

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.String(250), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    brand = db.Column(db.String(250))
    model = db.Column(db.String(250))
    slug = db.Column(db.String(500), nullable=False)
    fuel_type = db.Column(db.String(250))
    transmission = db.Column(db.String(250))
    vehicle_type = db.Column(db.String(250))
    year = db.Column(db.String(250))
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)    
    mileage = db.Column(db.Integer, nullable=False)
    has_transaction = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    images = db.relationship('Image', backref='product',
                              lazy=True, cascade='all, delete-orphan')
    
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'))
    seller = db.relationship('User', back_populates='products')

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "brand": self.brand,
            "slug": self.slug,
            "model": self.model,
            "fuel_type": self.fuel_type,
            "transmission": self.transmission,
            "vehicle_type": self.vehicle_type,
            "year": self.year,
            "description": self.description,
            "price": self.price,
            "mileage": self.mileage,
            "images": [image.path for image in self.images],
            "seller_name": self.seller.name,
            "seller_address": self.seller.address,
            "has_transaction": self.has_transaction,
        }
    
    
class Image(db.Model):
    __tablename__ = 'images'
    id = db.Column(db.String(250), primary_key=True, default=lambda: str(uuid.uuid4()))
    path = db.Column(db.Text, nullable=False)

    product_id = db.Column(db.Integer, db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False)


class Wishlist(db.Model):
    __tablename__ = 'wishlists'
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.String(250), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.String(250), db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False)

    user = db.relationship('User', backref=db.backref('wishlists', lazy=True, cascade='all, delete-orphan'))
    product = db.relationship('Product', backref=db.backref('wishlisted_in', lazy=True, cascade='all, delete-orphan'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint('user_id', 'product_id', name='unique_user_product'), #Same user shouldn't like same product twice
    )


class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)

    transaction_id = db.Column(db.Integer, nullable=False)
    product_id = db.Column(db.String(250), db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    seller = db.Column(db.String(250), nullable=False)
    buyer = db.Column(db.String(250), nullable=False)
    amount = db.Column(db.Float, nullable=False)  
    status = db.Column(db.Integer, nullable=False, default=0)
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    product = db.relationship('Product', backref='transactions', lazy=True)

    status_mapping = {0: "Pending", 1: "Delivered", 2: "Confirmed", 3: "Disputed", 4: "Cancelled", 5: "Finalized"}

    def to_dict(self):
        return {
            "transaction_id": self.transaction_id,
            "product_id": self.product_id,
            "seller": self.seller,
            "buyer": self.buyer,
            "amount": self.amount,
            "status": Transaction.status_mapping[self.status],
            "status_num": self.status,
            "image": self.product.images[0].path,
            "product_title": self.product.title,
            "created_at": self.created_at
        }



