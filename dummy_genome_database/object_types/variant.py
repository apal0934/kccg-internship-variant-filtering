from graphene_mongo import MongoengineObjectType

from dummy_genome_database.models.variant import VariantModel


class Variant(MongoengineObjectType):
    class Meta:
        model = VariantModel
