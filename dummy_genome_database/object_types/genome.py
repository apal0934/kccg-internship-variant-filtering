from graphene_mongo import MongoengineObjectType

from dummy_genome_database.models.genome import GenomeModel


class Genome(MongoengineObjectType):
    class Meta:
        model = GenomeModel
