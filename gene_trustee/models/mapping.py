from mongoengine import Document
from mongoengine.fields import IntField, StringField


class MappingModel(Document):
    user_id = IntField()
    genome_id = StringField()
