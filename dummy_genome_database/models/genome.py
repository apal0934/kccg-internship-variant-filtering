from mongoengine import Document
from mongoengine.fields import IntField, ListField


class GenomeModel(Document):
    genome_id = IntField()
    variants = ListField(IntField())
