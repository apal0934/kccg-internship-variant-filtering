from mongoengine import Document
from mongoengine.fields import IntField


class VariantModel(Document):
    variant_type = IntField()
