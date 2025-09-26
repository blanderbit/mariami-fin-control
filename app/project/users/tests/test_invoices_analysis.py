from datetime import date
from unittest.mock import Mock, patch
import pandas as pd
from decimal import Decimal

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APIClient
from rest_framework import status

from users.services.invoices_analysis_service import UserInvoicesAnalysisService
from users.models.user_data_file import UserDataFile

User = get_user_model()


class InvoicesAnalysisServiceTest(TestCase):
    """Test suite for UserInvoicesAnalysisService"""
    
    def setUp(self):
        """Set up test data and user"""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.service = UserInvoicesAnalysisService(self.user)
        
        # Clear cache before each test
        cache.clear()
        
        # Create mock invoices data
        self.mock_invoices_data = pd.DataFrame([
            {
                'Date': '2024-01-15',
                'Invoice_Number': 'INV-001',
                'Amount': 1000.0,
                'Status': 'paid'
            },
            {
                'Date': '2024-01-20',
                'Invoice_Number': 'INV-002',
                'Amount': 1500.0,
                'Status': 'overdue'
            },
            {
                'Date': '2024-02-01',
                'Invoice_Number': 'INV-003',
                'Amount': 2000.0,
                'Status': 'paid'
            },
            {
                'Date': '2024-02-10',
                'Invoice_Number': 'INV-004',
                'Amount': 800.0,
                'Status': 'pending'
            }
        ])
    
    @patch.object(UserInvoicesAnalysisService, '_get_dataframe_from_file')
    def test_get_invoices_analysis_basic(self, mock_get_df):
        """Test basic invoices analysis functionality"""
        # Setup mock
        mock_get_df.return_value = self.mock_invoices_data
        
        # Test data
        start_date = date(2024, 1, 1)
        end_date = date(2024, 2, 28)
        
        # Execute
        result = self.service.get_invoices_analysis(start_date, end_date)
        
        # Assertions
        self.assertEqual(result['total_count'], 4)
        self.assertEqual(result['paid_invoices']['total_count'], 2)
        self.assertEqual(result['paid_invoices']['total_amount'], 3000.0)
        self.assertEqual(result['overdue_invoices']['total_count'], 2)  # overdue + pending
        self.assertEqual(result['overdue_invoices']['total_amount'], 2300.0)
        
        # Check period info
        self.assertEqual(result['period']['start_date'], start_date.isoformat())
        self.assertEqual(result['period']['end_date'], end_date.isoformat())
    
    def test_calculate_paid_invoices_metrics(self):
        """Test paid invoices metrics calculation"""
        result = self.service._calculate_paid_invoices_metrics(self.mock_invoices_data)
        
        self.assertEqual(result['count'], 2)
        self.assertEqual(result['amount'], 3000.0)
    
    def test_calculate_overdue_invoices_metrics(self):
        """Test overdue invoices metrics calculation"""
        result = self.service._calculate_overdue_invoices_metrics(self.mock_invoices_data)
        
        # Should include both 'overdue' and 'pending' statuses
        self.assertEqual(result['count'], 2)
        self.assertEqual(result['amount'], 2300.0)
    
    def test_filter_invoices_data(self):
        """Test filtering invoices by date range"""
        start_date = date(2024, 1, 1)
        end_date = date(2024, 1, 31)
        
        filtered_data = self.service._filter_invoices_data(
            self.mock_invoices_data, start_date, end_date
        )
        
        # Should return only January invoices
        self.assertEqual(len(filtered_data), 2)
    
    def test_build_change_data(self):
        """Test change data calculation"""
        current = Decimal('100')
        previous = Decimal('80')
        
        result = self.service._build_change_data(current, previous)
        
        self.assertEqual(result['change'], 20.0)
        self.assertEqual(result['percentage_change'], 25.0)
    
    def test_build_change_data_from_zero(self):
        """Test change data when previous value is zero"""
        current = Decimal('100')
        previous = Decimal('0')
        
        result = self.service._build_change_data(current, previous)
        
        self.assertEqual(result['change'], 100.0)
        self.assertEqual(result['percentage_change'], 100.0)


class InvoicesAnalysisAPITest(TestCase):
    """Test suite for Invoices Analysis API endpoint"""
    
    def setUp(self):
        """Set up test client and user"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    @patch.object(UserInvoicesAnalysisService, 'get_invoices_analysis')
    def test_invoices_analysis_endpoint_success(self, mock_analysis):
        """Test successful invoices analysis API call"""
        # Setup mock response
        mock_response = {
            'total_count': 10,
            'paid_invoices': {'total_count': 7, 'total_amount': 10000.0},
            'overdue_invoices': {'total_count': 3, 'total_amount': 3000.0},
            'month_change': {
                'total_count': {'change': 2.0, 'percentage_change': 25.0},
                'paid_invoices': {
                    'count_change': {'change': 1.0, 'percentage_change': 16.67},
                    'amount_change': {'change': 2000.0, 'percentage_change': 25.0}
                },
                'overdue_invoices': {
                    'count_change': {'change': 1.0, 'percentage_change': 50.0},
                    'amount_change': {'change': 1000.0, 'percentage_change': 50.0}
                }
            },
            'year_change': {
                'total_count': {'change': 5.0, 'percentage_change': 100.0},
                'paid_invoices': {
                    'count_change': {'change': 3.0, 'percentage_change': 75.0},
                    'amount_change': {'change': 5000.0, 'percentage_change': 100.0}
                },
                'overdue_invoices': {
                    'count_change': {'change': 2.0, 'percentage_change': 200.0},
                    'amount_change': {'change': 2000.0, 'percentage_change': 200.0}
                }
            },
            'period': {
                'start_date': '2024-01-01',
                'end_date': '2024-01-31'
            }
        }
        mock_analysis.return_value = mock_response
        
        # Make API call
        response = self.client.get('/users/invoices-analysis', {
            'start_date': '2024-01-01',
            'end_date': '2024-01-31'
        })
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['total_count'], 10)
        self.assertEqual(data['paid_invoices']['total_count'], 7)
        self.assertEqual(data['overdue_invoices']['total_count'], 3)
    
    def test_invoices_analysis_endpoint_missing_params(self):
        """Test API call with missing parameters"""
        response = self.client.get('/users/invoices-analysis')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('errors', response.json())
    
    def test_invoices_analysis_endpoint_invalid_dates(self):
        """Test API call with invalid date range"""
        response = self.client.get('/users/invoices-analysis', {
            'start_date': '2024-02-01',
            'end_date': '2024-01-01'  # End date before start date
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('errors', response.json())
    
    def test_invoices_analysis_endpoint_unauthenticated(self):
        """Test API call without authentication"""
        self.client.logout()
        
        response = self.client.get('/users/invoices-analysis', {
            'start_date': '2024-01-01',
            'end_date': '2024-01-31'
        })
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)