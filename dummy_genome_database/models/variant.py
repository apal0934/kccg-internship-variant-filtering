from mongoengine import Document
from mongoengine.fields import StringField, ListField


class VariantModel(Document):
    name = StringField()
    hpo_terms = ListField(StringField())
