"""
Enhanced error handling utilities for the Bookswaps application.
"""
import logging
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides more detailed error responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Log the error for debugging
    view = context.get('view', None)
    request = context.get('request', None)
    
    error_context = {
        'view': view.__class__.__name__ if view else 'Unknown',
        'method': request.method if request else 'Unknown',
        'path': request.path if request else 'Unknown',
        'user': str(request.user) if request and hasattr(request, 'user') else 'Anonymous',
        'error_type': exc.__class__.__name__,
        'error_message': str(exc)
    }
    
    logger.error(f"API Error: {error_context}")
    
    # Handle specific error types
    if isinstance(exc, IntegrityError):
        return handle_integrity_error(exc)
    elif isinstance(exc, ValidationError):
        return handle_validation_error(exc)
    
    # If response is None, create a custom one
    if response is None:
        custom_response_data = {
            'error': 'An unexpected error occurred',
            'details': str(exc),
            'type': exc.__class__.__name__
        }
        return Response(custom_response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Enhance existing response with more context
    if hasattr(response, 'data'):
        if isinstance(response.data, dict):
            response.data['error_type'] = exc.__class__.__name__
            response.data['timestamp'] = context.get('request').META.get('HTTP_X_TIMESTAMP') if context.get('request') else None
    
    return response

def handle_integrity_error(exc):
    """
    Handle database integrity constraint violations.
    """
    error_message = str(exc).lower()
    
    if 'isbn' in error_message and 'unique' in error_message:
        return Response({
            'error': 'A book with this ISBN already exists in the system',
            'error_type': 'DUPLICATE_ISBN',
            'details': 'Please check if this book is already in your library or use a different ISBN'
        }, status=status.HTTP_409_CONFLICT)
    
    elif 'email' in error_message and 'unique' in error_message:
        return Response({
            'error': 'An account with this email already exists',
            'error_type': 'DUPLICATE_EMAIL',
            'details': 'Please use a different email address or try logging in'
        }, status=status.HTTP_409_CONFLICT)
    
    elif 'username' in error_message and 'unique' in error_message:
        return Response({
            'error': 'This username is already taken',
            'error_type': 'DUPLICATE_USERNAME',
            'details': 'Please choose a different username'
        }, status=status.HTTP_409_CONFLICT)
    
    else:
        return Response({
            'error': 'Database constraint violation',
            'error_type': 'INTEGRITY_ERROR',
            'details': 'The operation violates database constraints'
        }, status=status.HTTP_400_BAD_REQUEST)

def handle_validation_error(exc):
    """
    Handle Django validation errors.
    """
    if hasattr(exc, 'error_dict'):
        # Field-specific validation errors
        return Response({
            'error': 'Validation failed',
            'error_type': 'VALIDATION_ERROR',
            'details': exc.error_dict
        }, status=status.HTTP_400_BAD_REQUEST)
    
    elif hasattr(exc, 'error_list'):
        # General validation errors
        return Response({
            'error': 'Validation failed',
            'error_type': 'VALIDATION_ERROR',
            'details': [str(error) for error in exc.error_list]
        }, status=status.HTTP_400_BAD_REQUEST)
    
    else:
        return Response({
            'error': 'Validation failed',
            'error_type': 'VALIDATION_ERROR',
            'details': str(exc)
        }, status=status.HTTP_400_BAD_REQUEST)

def log_book_operation(operation, book_data, user, success=True, error=None):
    """
    Log book operations for debugging and analytics.
    """
    log_data = {
        'operation': operation,
        'user': str(user),
        'book_title': book_data.get('title', 'Unknown'),
        'book_isbn': book_data.get('isbn', 'No ISBN'),
        'success': success
    }
    
    if success:
        logger.info(f"Book operation successful: {log_data}")
    else:
        log_data['error'] = str(error) if error else 'Unknown error'
        logger.error(f"Book operation failed: {log_data}")

def log_user_action(action, user, details=None, success=True, error=None):
    """
    Log user actions for debugging and analytics.
    """
    log_data = {
        'action': action,
        'user': str(user),
        'success': success
    }
    
    if details:
        log_data['details'] = details
    
    if success:
        logger.info(f"User action successful: {log_data}")
    else:
        log_data['error'] = str(error) if error else 'Unknown error'
        logger.error(f"User action failed: {log_data}")
