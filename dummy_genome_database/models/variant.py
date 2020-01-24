from mongoengine import Document
from mongoengine.fields import StringField


class VariantModel(Document):
    hpo_term = StringField()
