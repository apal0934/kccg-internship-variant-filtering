from mongoengine import Document
from mongoengine.fields import IntField, ListField, ReferenceField

from dummy_genome_database.models.variant import VariantModel


class GenomeModel(Document):
    genome_id = IntField()
    variants = ListField(ReferenceField(VariantModel))
