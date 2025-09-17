import os
from decimal import Decimal
from datetime import date
from unittest.mock import Mock, patch
import pandas as pd

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.utils import timezone

from users.services.revenue_analysis_service import UserDataAnalysisService

User = get_user_model()


class UserDataAnalysisServiceTest(TestCase):
    """Test suite for UserDataAnalysisService"""
    
    def setUp(self):
        """Set up test data and user"""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.service = UserDataAnalysisService(self.user)
        
        # Clear cache before each test
        cache.clear()
        
        # Load mock P&L data
        self.mock_pnl_data = self._load_mock_pnl_data()
    
    def _load_mock_pnl_data(self):
        """Load mock P&L data from test file"""
        test_data_path = os.path.join(
            os.path.dirname(__file__),
            'test_data',
            'mock_pnl_data.csv'
        )
        
        return pd.read_csv(test_data_path)
    
    def tearDown(self):
        """Clean up after tests"""
        cache.clear()
    
    @patch('users.services.revenue_analysis_service.'
           'UserDataAnalysisService._get_dataframe_from_file')
    def test_monthly_revenue_analysis_september_2025(self, mock_get_dataframe):
        """Test month-to-month analysis for September 2025"""
        # Mock the current date to September 2025
        with patch('django.utils.timezone.now') as mock_now:
            mock_now.return_value.date.return_value = date(2025, 9, 15)
            
            # Mock the dataframe return
            mock_get_dataframe.return_value = self.mock_pnl_data
            
            result = self.service.get_revenue_analysis('month')
            
            # Verify results
            self.assertEqual(result['period_type'], 'month')
            
            # September 2025: 82000, August 2025: 77000
            self.assertEqual(result['current_revenue'], 82000.0)
            self.assertEqual(result['previous_revenue'], 77000.0)
            self.assertEqual(result['change'], 5000.0)
            self.assertAlmostEqual(
                float(result['percentage_change']), 6.49, places=1
            )
            self.assertTrue(result['is_positive_change'])
            self.assertEqual(result['currency'], 'USD')
    
    @patch('users.services.revenue_analysis_service.'
           'UserDataAnalysisService._get_dataframe_from_file')
    def test_yearly_revenue_analysis_2025(self, mock_get_dataframe):
        """Test year-to-year analysis for 2025"""
        with patch('django.utils.timezone.now') as mock_now:
            mock_now.return_value.date.return_value = date(2025, 9, 15)
            
            mock_get_dataframe.return_value = self.mock_pnl_data
            
            result = self.service.get_revenue_analysis('year')
            
            # Verify results
            self.assertEqual(result['period_type'], 'year')
            
            # 2025 YTD (Jan-Sep): All 2025 data, 2024: All 2024 data
            expected_2025_ytd = (
                65000 + 68000 + 72000 + 69000 +
                75000 + 78000 + 74000 + 77000 + 82000
            )
            # 2024 full year (all 12 months)
            expected_2024_ytd = (
                38000 + 42000 + 45000 + 40000 +
                48000 + 52000 + 47000 + 50000 +
                55000 + 58000 + 54000 + 62000
            )
            
            self.assertEqual(
                result['current_revenue'], float(expected_2025_ytd)
            )
            self.assertEqual(
                result['previous_revenue'], float(expected_2024_ytd)
            )
            self.assertEqual(
                result['change'],
                float(expected_2025_ytd - expected_2024_ytd)
            )
            self.assertTrue(result['is_positive_change'])
    
    @patch('users.services.revenue_analysis_service.'
           'UserDataAnalysisService._get_dataframe_from_file')
    def test_no_data_available(self, mock_get_dataframe):
        """Test when no P&L data is available"""
        mock_get_dataframe.return_value = None
        
        with patch('django.utils.timezone.now') as mock_now:
            mock_now.return_value.date.return_value = date(2025, 9, 15)
            
            result = self.service.get_revenue_analysis('month')
            
            # Should return zero values when no data
            self.assertEqual(result['current_revenue'], 0.0)
            self.assertEqual(result['previous_revenue'], 0.0)
            self.assertEqual(result['change'], 0.0)
            self.assertEqual(result['percentage_change'], 0.0)
            # change >= 0 is True
            self.assertTrue(result['is_positive_change'])
    
    @patch('users.services.revenue_analysis_service.'
           'UserDataAnalysisService._get_dataframe_from_file')
    def test_invalid_pnl_data_structure(self, mock_get_dataframe):
        """Test with P&L data missing required columns"""
        # Create DataFrame without Revenue column
        invalid_data = pd.DataFrame({
            'Month': ['2025-01', '2025-02'],
            'Sales': [10000, 12000]  # Wrong column name
        })
        
        mock_get_dataframe.return_value = invalid_data
        
        with patch('django.utils.timezone.now') as mock_now:
            mock_now.return_value.date.return_value = date(2025, 9, 15)
            
            result = self.service.get_revenue_analysis('month')
            
            # Should return zero values for invalid data
            self.assertEqual(result['current_revenue'], 0.0)
            self.assertEqual(result['previous_revenue'], 0.0)
    
    @patch('users.services.revenue_analysis_service.'
           'UserDataAnalysisService._get_dataframe_from_file')
    def test_caching_functionality(self, mock_get_dataframe):
        """Test that results are properly cached"""
        mock_get_dataframe.return_value = self.mock_pnl_data
        
        with patch('django.utils.timezone.now') as mock_now:
            mock_now.return_value.date.return_value = date(2025, 9, 15)
            
            # First call
            result1 = self.service.get_revenue_analysis('month')
            
            # Second call should use cache (mock should only be called once)
            result2 = self.service.get_revenue_analysis('month')
            
            # Results should be identical
            self.assertEqual(result1, result2)
            
            # Verify mock was called only once (first time)
            self.assertEqual(mock_get_dataframe.call_count, 1)
    
    @patch('users.services.revenue_analysis_service.'
           'UserDataAnalysisService._get_dataframe_from_file')
    def test_negative_growth(self, mock_get_dataframe):
        """Test scenario with negative revenue growth"""
        # Create data where current period is lower than previous
        declining_data = pd.DataFrame({
            'Month': ['2025-08', '2025-09'],
            'Revenue': [100000, 80000]  # 20% decline
        })
        
        mock_get_dataframe.return_value = declining_data
        
        with patch('django.utils.timezone.now') as mock_now:
            mock_now.return_value.date.return_value = date(2025, 9, 15)
            
            result = self.service.get_revenue_analysis('month')
            
            self.assertEqual(result['current_revenue'], 80000.0)
            self.assertEqual(result['previous_revenue'], 100000.0)
            self.assertEqual(result['change'], -20000.0)
            self.assertEqual(result['percentage_change'], -20.0)
            self.assertFalse(result['is_positive_change'])
    
    @patch('users.models.user_data_file.UserDataFile.objects.filter')
    def test_dataframe_from_file_integration(
        self, mock_filter
    ):
        """Test the _get_dataframe_from_file method"""
        # Mock UserDataFile query
        mock_file = Mock()
        mock_file.file_path = 'user_1/pnl_template/test.csv'
        mock_file.is_active = True
        
        # Mock the filter chain
        mock_queryset = Mock()
        mock_queryset.order_by.return_value.first.return_value = mock_file
        mock_filter.return_value = mock_queryset
        
        # Mock MinIO response with CSV data
        csv_content = self.mock_pnl_data.to_csv(index=False)
        mock_response = Mock()
        mock_response.read.return_value = csv_content.encode('utf-8')
        
        # Patch the minio_client on the service instance
        with patch.object(
            self.service, 'minio_client'
        ) as mock_minio_client:
            mock_minio_client.client.get_object.return_value = mock_response
            
            # Test the method
            result_df = self.service._get_dataframe_from_file('pnl_template')
            
            # Verify DataFrame is returned correctly
            self.assertIsNotNone(result_df)
            self.assertIn('Revenue', result_df.columns)
            self.assertIn('Month', result_df.columns)
            self.assertGreater(len(result_df), 0)
    
    def test_pnl_revenue_calculation_edge_cases(self):
        """Test P&L revenue calculation with edge cases"""
        # Test with empty DataFrame
        empty_df = pd.DataFrame()
        result = self.service._get_pnl_revenue_for_period(
            empty_df,
            date(2025, 9, 1),
            date(2025, 10, 1)
        )
        self.assertEqual(result, Decimal('0'))
        
        # Test with NaN values
        nan_data = pd.DataFrame({
            'Month': ['2025-09'],
            'Revenue': [float('nan')]
        })
        result = self.service._get_pnl_revenue_for_period(
            nan_data,
            date(2025, 9, 1),
            date(2025, 10, 1)
        )
        self.assertEqual(result, Decimal('0'))
    
    def test_cache_invalidation(self):
        """Test cache invalidation functionality"""
        # Set up cache with some data
        cache_key = (
            f"revenue_analysis_{self.user.id}_month_"
            f"{timezone.now().strftime('%Y-%m-%d')}"
        )
        test_data = {'test': 'data'}
        cache.set(cache_key, test_data)
        
        # Verify cache has data
        self.assertEqual(cache.get(cache_key), test_data)
        
        # Invalidate cache
        self.service.invalidate_cache()
        
        # Verify cache is cleared
        self.assertIsNone(cache.get(cache_key))


class RevenueAnalysisIntegrationTest(TestCase):
    """Integration tests for revenue analysis"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='integration@example.com',
            password='testpass123'
        )
    
    def test_full_revenue_analysis_workflow(self):
        """Test the complete workflow from file upload to analysis"""
        # This would be an integration test that:
        # 1. Creates a UserDataFile record
        # 2. Mocks MinIO with actual CSV data
        # 3. Calls the analysis service
        # 4. Verifies the complete workflow
        
        # For now, we'll just test that the service can be instantiated
        service = UserDataAnalysisService(self.user)
        self.assertIsNotNone(service)
        self.assertEqual(service.user, self.user)