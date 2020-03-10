from mongoengine import Document
from mongoengine.fields import StringField


class MappingModel(Document):
    user_id = StringField()
    genome_id = StringField()
