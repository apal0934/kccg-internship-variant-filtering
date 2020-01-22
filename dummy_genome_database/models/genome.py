from mongoengine import Document
from mongoengine.fields import ListField, IntField


class GenomeModel(Document):
    genome_id = IntField()
    variants = ListField(IntField())
