from rest_framework import serializers
from .models import BaseFile, ProfileImage, ChatFile
class BaseFileSerializer(serializers.ModelSerializer):
    file_type: str
    file_model: type[ChatFile] | type[ProfileImage]
    url = serializers.SerializerMethodField()



    def get_url(self, obj):
        request = self.context.get('request')
        host = request.get_host().replace(":8000", "") if request else "localhost"
        return f"http://{host}/files/{self.file_type}/secure-media/{obj.access_token}/"
    
    def create(self, validated_data):
        uploaded_file = validated_data['file']
        user = self.context["request"].user
        validated_data["user"] =  user
        validated_data['file_name'] = uploaded_file.name
        validated_data['file_size'] = uploaded_file.size
        validated_data['file_type'] = self.detect_type(uploaded_file.name)
        return super().create(validated_data)

    def detect_type(self, filename):
        ext = filename.split('.')[-1].lower()
        if ext in ['png', 'jpg', 'jpeg', 'gif']:
            return 'img'
        elif ext in ['txt', 'md', 'log']:
            return 'txt'
        elif ext in ['exe', 'msi']:
            return 'exe'
        else:
            return 'other'
        
class ChatFileSerializer(BaseFileSerializer):
    file_model = ChatFile
    file_type = "chat"
    
    class Meta:
        model = ChatFile
        fields = ['id', 'original_name', 'file_size', 'file_type', 'mime_type', 'url', 'created_at',"user"]
    
class ProfilePictureSerializer(BaseFileSerializer):
    file_model = ProfileImage
    file_type = "profile"
    
    class Meta:
        model = ProfileImage
        fields = ['id', 'original_name', 'file_size', 'file_type', 'mime_type', 'url', 'created_at',"user"]
        
