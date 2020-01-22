from mongoengine import Document
from mongoengine.fields import ReferenceField, ListField, IntField
from dummy_genome_database.models.variant import VariantModel


class GenomeModel(Document):
    genome_id = IntField()
    variants = ListField(ReferenceField(VariantModel))
