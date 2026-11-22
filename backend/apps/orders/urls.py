from django.urls import path
from .views import (
    ShippingAddressListCreateView, ShippingAddressDetailView,
    CartView, CartItemDetailView, CheckoutView, MyOrdersView,
    OrderDetailView, CancelOrderView,
)

urlpatterns = [
    path("addresses/", ShippingAddressListCreateView.as_view(), name="shipping-addresses"),
    path("addresses/<int:pk>/", ShippingAddressDetailView.as_view(), name="shipping-address-detail"),
    path("cart/", CartView.as_view(), name="shopping-cart"),
    path("cart/items/<int:item_id>/", CartItemDetailView.as_view(), name="cart-item-detail"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("orders/", MyOrdersView.as_view(), name="my-orders"),
    path("orders/<uuid:order_number>/", OrderDetailView.as_view(), name="order-detail"),
    path("orders/<uuid:order_number>/cancel/", CancelOrderView.as_view(), name="cancel-order"),
]
