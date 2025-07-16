from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, user_profile, BankViewSet, AccountViewSet,
    TransactionViewSet, setup_banks, dashboard_data
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'banks', BankViewSet, basename='bank')
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', user_profile, name='user-profile'),

    # Banking APIs
    path('setup-banks/', setup_banks, name='setup-banks'),
    path('dashboard/', dashboard_data, name='dashboard-data'),

    # ViewSet URLs
    path('', include(router.urls)),
]
