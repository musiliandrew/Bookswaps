from rest_framework import serializers
from .models import Books, BookHistory, Libraries
from django.contrib.auth import get_user_model
from django.utils.timezone import now
import uuid

User = get_user_model()

class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class LibraryBookSerializer(serializers.ModelSerializer):
    owner = OwnerSerializer(read_only=True)

    class Meta:
        model = Books
        fields = [
            'book_id', 'title', 'author', 'genre', 'cover_image_url',
            'available_for_exchange', 'available_for_borrow', 'owner'
        ]
        
class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class BookHistorySerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username')

    class Meta:
        model = BookHistory
        fields = ['user', 'status', 'start_date', 'end_date']

class BookDetailSerializer(serializers.ModelSerializer):
    owner = SimpleUserSerializer(read_only=True)
    original_owner = SimpleUserSerializer(read_only=True)
    history = serializers.SerializerMethodField()

    class Meta:
        model = Books
        fields = [
            'book_id', 'title', 'author', 'genre', 'synopsis',
            'available_for_exchange', 'owner', 'original_owner', 'history'
        ]

    def get_history(self, obj):
        history_qs = BookHistory.objects.filter(book=obj).order_by('-start_date')[:5]
        return BookHistorySerializer(history_qs, many=True).data
    
class BookSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Books
        fields = ['book_id', 'title', 'author']
        
class AddBookSerializer(serializers.ModelSerializer):
    condition = serializers.CharField(write_only=True)  # Used for Libraries entry

    class Meta:
        model = Books
        fields = [
            'title', 'author', 'genre', 'isbn',
            'condition', 'synopsis', 'available_for_exchange'
        ]

    def validate_isbn(self, value):
        if Books.objects.filter(isbn=value).exists():
            raise serializers.ValidationError("A book with this ISBN already exists.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        condition = validated_data.pop('condition')

        # Create Book
        book = Books.objects.create(
            **validated_data,
            owner=user,
            original_owner=user,
            qr_code_id=uuid.uuid4()
        )

        # Link to Libraries with status = Owned
        Libraries.objects.create(
            user=user,
            book=book,
            condition=condition,
            status='Owned',
            date_added=now()
        )

        return book
    
    
class UserLibraryBookSerializer(serializers.ModelSerializer):
    book_id = serializers.UUIDField(source='book.book_id', read_only=True)
    title = serializers.CharField(source='book.title', read_only=True)
    author = serializers.CharField(source='book.author', read_only=True)
    available_for_exchange = serializers.BooleanField(source='book.available_for_exchange', read_only=True)

    class Meta:
        model = Libraries
        fields = ['book_id', 'title', 'author', 'status', 'available_for_exchange']
        
class BookAvailabilityUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Books
        fields = ['available_for_exchange', 'available_for_borrow']